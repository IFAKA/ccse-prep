import type {AppEvent,AppState} from "./types"; import {blankState,reduceEvents} from "./events"; import {validateSyncEvents} from "./sync";
const DB="ccse-2026", STORE="events";
export const CURRENT_SCHEMA_VERSION = 2;
const OPEN_TIMEOUT_MS = 2000;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => finishReject(new Error("IndexedDB open timed out")), OPEN_TIMEOUT_MS);
    const finishReject = (error: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(error);
    };
    const req = indexedDB.open(DB, CURRENT_SCHEMA_VERSION);
    req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, {keyPath: "eventId"}); };
    req.onblocked = () => finishReject(new Error("IndexedDB open blocked"));
    req.onerror = () => finishReject(req.error ?? new Error("IndexedDB open failed"));
    req.onsuccess = () => {
      const db = req.result;
      if (settled) {
        db.close();
        return;
      }
      settled = true;
      clearTimeout(timer);
      db.onversionchange = () => db.close();
      resolve(db);
    };
  });
}

export async function loadState(): Promise<AppState> {
  if (typeof indexedDB === "undefined") return blankState();

  try {
    const db = await openDatabase();
    return await new Promise((resolve) => {
      let settled = false;
      const finish = (state: AppState) => {
        if (settled) return;
        settled = true;
        db.close();
        resolve(state);
      };

      try {
        const tx = db.transaction(STORE, "readonly");
        const get = tx.objectStore(STORE).getAll();
        get.onsuccess = () => {
          try {
            finish({...reduceEvents(get.result as AppEvent[]), schemaVersion: CURRENT_SCHEMA_VERSION});
          } catch {
            finish(blankState());
          }
        };
        get.onerror = () => finish(blankState());
        tx.onabort = () => finish(blankState());
      } catch {
        finish(blankState());
      }
    });
  } catch {
    return blankState();
  }
}

async function appendEvents(events: readonly AppEvent[]) { if(typeof indexedDB==="undefined" || !events.length)return; await new Promise<void>((resolve,reject)=>{openDatabase().then(db=>{try{const tx=db.transaction(STORE,"readwrite");const store=tx.objectStore(STORE);events.forEach(event=>store.put(event));tx.oncomplete=()=>{db.close();resolve()};tx.onabort=()=>{db.close();reject(tx.error??new Error("IndexedDB transaction aborted"))};tx.onerror=()=>{db.close();reject(tx.error??new Error("IndexedDB transaction failed"))}}catch(error){db.close();reject(error)}}).catch(reject)}) }
export async function appendEvent(event:AppEvent){ await appendEvents([event]); }
export async function exportState(){const state=await loadState();return JSON.stringify({schemaVersion:state.schemaVersion,events:state.events},null,2)}
export async function importState(json:string){const parsed=JSON.parse(json);if(!parsed||typeof parsed.schemaVersion!=="number"||parsed.schemaVersion > CURRENT_SCHEMA_VERSION||!Array.isArray(parsed.events))throw new Error("Unsupported or invalid CCSE export");await appendEvents(validateSyncEvents(parsed.events));return loadState()}
export async function mergeEvents(events:readonly AppEvent[]){await appendEvents(validateSyncEvents(events));return loadState()}
export async function resetState(){if(typeof indexedDB==="undefined")return;await new Promise<void>((resolve,reject)=>{const req=indexedDB.deleteDatabase(DB);req.onsuccess=()=>resolve();req.onerror=()=>reject(req.error)})}
