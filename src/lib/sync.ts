import type { AppEvent } from "./types";

const ALLOWED_TYPES = new Set<AppEvent["type"]>(["ANSWER_RECORDED", "MOCK_COMPLETED", "MISCONCEPTION_UPDATED"]);
export type SyncEventMessage = { protocol: "ccse-sync-v1"; type: "events"; events: AppEvent[] };

export function validateSyncEvents(value: unknown): AppEvent[] {
  if (!Array.isArray(value) || value.length > 10000) throw new Error("Invalid sync event list");
  for (const event of value) {
    if (!event || typeof event !== "object") throw new Error("Invalid sync event");
    const candidate = event as Partial<AppEvent>;
    if (typeof candidate.eventId !== "string" || candidate.eventId.length > 200) throw new Error("Invalid event ID");
    if (typeof candidate.deviceId !== "string" || !candidate.deviceId || typeof candidate.timestamp !== "number" || !Number.isFinite(candidate.timestamp) || candidate.timestamp < 0) throw new Error("Invalid event metadata");
    if (!ALLOWED_TYPES.has(candidate.type as AppEvent["type"]) || !candidate.payload || typeof candidate.payload !== "object" || Array.isArray(candidate.payload)) throw new Error("Invalid event type or payload");
    const payload = candidate.payload as Record<string, unknown>;
    if (candidate.type === "ANSWER_RECORDED" && (!Number.isInteger(payload.questionId) || typeof payload.correct !== "boolean")) throw new Error("Invalid answer event payload");
    if (candidate.type === "MOCK_COMPLETED" && (!payload.result || typeof payload.result !== "object")) throw new Error("Invalid mock event payload");
    if (candidate.type === "MISCONCEPTION_UPDATED" && (!payload.memory || typeof payload.memory !== "object")) throw new Error("Invalid memory event payload");
  }
  return [...(value as AppEvent[])].sort((a,b)=>a.timestamp-b.timestamp||a.deviceId.localeCompare(b.deviceId)||a.eventId.localeCompare(b.eventId));
}

async function waitForIce(peer: RTCPeerConnection) {
  if (peer.iceGatheringState === "complete") return;
  await new Promise<void>((resolve) => {
    const timeout = window.setTimeout(resolve, 5000);
    peer.addEventListener("icegatheringstatechange", () => {
      if (peer.iceGatheringState === "complete") { window.clearTimeout(timeout); resolve(); }
    });
  });
}

function bindChannel(channel: RTCDataChannel, events: AppEvent[], onEvents: (events: AppEvent[]) => void) {
  channel.onopen = () => channel.send(JSON.stringify({ protocol: "ccse-sync-v1", type: "events", events } satisfies SyncEventMessage));
  channel.onmessage = (message) => {
    try {
      const parsed = JSON.parse(String(message.data)) as SyncEventMessage;
      if (parsed.protocol === "ccse-sync-v1" && parsed.type === "events") onEvents(validateSyncEvents(parsed.events));
    } catch { /* Ignore malformed remote data. */ }
  };
}

export type HostSession = { pairingCode: string; waitForAnswer: () => Promise<void>; close: () => void };
export type JoinSession = { close: () => void };

async function signal(body: Record<string, unknown>) {
  const result = await fetch("/api/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const payload = await result.json() as { error?: string; code?: string; offer?: RTCSessionDescriptionInit; answer?: RTCSessionDescriptionInit | null };
  if (!result.ok) throw new Error(payload.error ?? "Pairing service unavailable");
  return payload;
}

async function getSignal(code: string) {
  const result = await fetch(`/api/sync?code=${encodeURIComponent(code)}`, { cache: "no-store" });
  const payload = await result.json() as { error?: string; offer?: RTCSessionDescriptionInit; answer?: RTCSessionDescriptionInit | null };
  if (!result.ok) throw new Error(payload.error ?? "Pairing code expired");
  return payload;
}

function sleep(ms: number) { return new Promise((resolve) => window.setTimeout(resolve, ms)); }

export async function createHostSession(localEvents: AppEvent[], onEvents: (events: AppEvent[]) => void): Promise<HostSession> {
  const peer = new RTCPeerConnection({ iceServers: [] });
  bindChannel(peer.createDataChannel("ccse-events"), localEvents, onEvents);
  await peer.setLocalDescription(await peer.createOffer());
  await waitForIce(peer);
  const offer = peer.localDescription;
  if (!offer?.sdp || (offer.type !== "offer" && offer.type !== "pranswer")) throw new Error("Could not create a sync offer");
  const created = await signal({ action: "create", offer: { type: "offer", sdp: offer.sdp } });
  if (!created.code) throw new Error("Could not create a pairing code");
  const pairingCode = created.code;
  let closed = false;
  return { pairingCode, waitForAnswer: async () => {
    while (!closed) {
      const current = await getSignal(pairingCode);
      if (current.answer) {
        await peer.setRemoteDescription(current.answer);
        return;
      }
      await sleep(700);
    }
    throw new Error("Sync session closed");
  }, close: () => { closed = true; peer.close(); } };
}

export async function createJoinSession(value: string, localEvents: AppEvent[], onEvents: (events: AppEvent[]) => void): Promise<JoinSession> {
  if (!/^\d{6}$/.test(value)) throw new Error("Enter the six-digit pairing code");
  const signalData = await getSignal(value);
  if (!signalData.offer?.sdp) throw new Error("Pairing offer is missing");
  const peer = new RTCPeerConnection({ iceServers: [] });
  peer.ondatachannel = ({channel}) => bindChannel(channel, localEvents, onEvents);
  await peer.setRemoteDescription(signalData.offer);
  await peer.setLocalDescription(await peer.createAnswer());
  await waitForIce(peer);
  const answer = peer.localDescription;
  if (!answer?.sdp || (answer.type !== "answer" && answer.type !== "pranswer")) throw new Error("Could not create a sync answer");
  await signal({ action: "answer", code: value, answer: { type: "answer", sdp: answer.sdp } });
  return { close: () => peer.close() };
}
