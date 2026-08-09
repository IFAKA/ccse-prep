import type { AppEvent, AppState, QuestionState, MockResult, Memory } from "./types"; import {recordAnswer} from "./scheduler";
export const CURRENT_SCHEMA_VERSION = 2;
export const blankState=():AppState=>({schemaVersion:CURRENT_SCHEMA_VERSION,questionStates:{},mockHistory:[],sessions:[],settings:{sound:false,dailyTarget:10},memories:[],events:[]});
export function reduceEvent(state:AppState,event:AppEvent):AppState { if(state.events.some(e=>e.eventId===event.eventId)) return state; const next={...state,events:[...state.events,event]};
  if(event.type==="ANSWER_RECORDED"){const p=event.payload;const id=Number(p.questionId);next.questionStates={...state.questionStates,[id]:recordAnswer(state.questionStates[id],Boolean(p.correct),event.timestamp,Number(p.responseMs)||0)};}
  if(event.type==="MOCK_COMPLETED") next.mockHistory=[event.payload.result as MockResult,...state.mockHistory];
  if(event.type==="MISCONCEPTION_UPDATED") next.memories=[event.payload.memory as Memory,...state.memories.filter(m=>m.questionId!==Number((event.payload.memory as Memory).questionId))];
  return next;
}
export function reduceEvents(events:readonly AppEvent[]) {
  return [...events].sort((a,b)=>a.timestamp-b.timestamp||a.deviceId.localeCompare(b.deviceId)||a.eventId.localeCompare(b.eventId)).reduce(reduceEvent,blankState());
}
export const makeEvent=(type:AppEvent["type"],payload:Record<string,unknown>):AppEvent=>({eventId:crypto.randomUUID(),deviceId:getDeviceId(),timestamp:Date.now(),type,payload});
function getDeviceId(){ if(typeof window==="undefined") return "server"; const key="ccse-device-id";let id=localStorage.getItem(key);if(!id){id=crypto.randomUUID();localStorage.setItem(key,id)}return id; }
