import type { AppEvent } from "./types";

const ALLOWED_TYPES = new Set<AppEvent["type"]>(["ANSWER_RECORDED", "MOCK_COMPLETED", "MISCONCEPTION_UPDATED"]);
export type SyncPayload = { protocol: "ccse-sync-v1"; sessionId: string; role: "offer" | "answer"; description: RTCSessionDescriptionInit };
export type SyncEventMessage = { protocol: "ccse-sync-v1"; type: "events"; events: AppEvent[] };

export function validateSyncEvents(value: unknown): AppEvent[] {
  if (!Array.isArray(value) || value.length > 10000) throw new Error("Invalid sync event list");
  for (const event of value) {
    if (!event || typeof event !== "object") throw new Error("Invalid sync event");
    const candidate = event as Partial<AppEvent>;
    if (typeof candidate.eventId !== "string" || candidate.eventId.length > 200) throw new Error("Invalid event ID");
    if (typeof candidate.deviceId !== "string" || typeof candidate.timestamp !== "number") throw new Error("Invalid event metadata");
    if (!ALLOWED_TYPES.has(candidate.type as AppEvent["type"]) || !candidate.payload || typeof candidate.payload !== "object") throw new Error("Invalid event type or payload");
  }
  return value as AppEvent[];
}

function parsePayload(value: string): SyncPayload {
  let parsed: unknown;
  try { parsed = JSON.parse(value); } catch { throw new Error("Pairing code is not valid JSON"); }
  if (!parsed || typeof parsed !== "object") throw new Error("Invalid pairing code");
  const payload = parsed as Partial<SyncPayload>;
  if (payload.protocol !== "ccse-sync-v1" || typeof payload.sessionId !== "string" || !payload.description) throw new Error("Unsupported pairing code");
  return payload as SyncPayload;
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

function makePayload(sessionId: string, role: SyncPayload["role"], peer: RTCPeerConnection): string {
  return JSON.stringify({ protocol: "ccse-sync-v1", sessionId, role, description: peer.localDescription });
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

export type HostSession = { pairingCode: string; applyAnswer: (answerCode: string) => Promise<void>; close: () => void };
export type JoinSession = { answerCode: string; close: () => void };

export async function createHostSession(localEvents: AppEvent[], onEvents: (events: AppEvent[]) => void): Promise<HostSession> {
  const peer = new RTCPeerConnection({ iceServers: [] });
  const sessionId = crypto.randomUUID();
  bindChannel(peer.createDataChannel("ccse-events"), localEvents, onEvents);
  await peer.setLocalDescription(await peer.createOffer());
  await waitForIce(peer);
  return { pairingCode: makePayload(sessionId, "offer", peer), applyAnswer: async (value) => {
    const answer = parsePayload(value);
    if (answer.role !== "answer" || answer.sessionId !== sessionId) throw new Error("This answer belongs to another session");
    await peer.setRemoteDescription(answer.description);
  }, close: () => peer.close() };
}

export async function createJoinSession(value: string, localEvents: AppEvent[], onEvents: (events: AppEvent[]) => void): Promise<JoinSession> {
  const offer = parsePayload(value);
  if (offer.role !== "offer") throw new Error("Paste an offer code from the other device");
  const peer = new RTCPeerConnection({ iceServers: [] });
  peer.ondatachannel = ({channel}) => bindChannel(channel, localEvents, onEvents);
  await peer.setRemoteDescription(offer.description);
  await peer.setLocalDescription(await peer.createAnswer());
  await waitForIce(peer);
  return { answerCode: makePayload(offer.sessionId, "answer", peer), close: () => peer.close() };
}
