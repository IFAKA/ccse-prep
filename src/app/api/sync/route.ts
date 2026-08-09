import { NextResponse } from "next/server";

const TTL_MS = 5 * 60 * 1000;
type Description = { type: "offer" | "answer"; sdp: string };
type RecordValue = { offer: Description; answer?: Description; expiresAt: number };

const records = new Map<string, RecordValue>();

function cleanExpired() {
  const now = Date.now();
  for (const [code, record] of records) if (record.expiresAt <= now) records.delete(code);
}

function validDescription(value: unknown, type: Description["type"]): value is Description {
  if (!value || typeof value !== "object") return false;
  const description = value as Partial<Description>;
  return description.type === type && typeof description.sdp === "string" && description.sdp.length > 0 && description.sdp.length < 10000;
}

function validCode(value: unknown): value is string {
  return typeof value === "string" && /^\d{6}$/.test(value);
}

function response(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  cleanExpired();
  const code = new URL(request.url).searchParams.get("code");
  if (!validCode(code)) return response({ error: "Invalid pairing code" }, 400);
  const record = records.get(code);
  if (!record) return response({ error: "Pairing code expired or not found" }, 404);
  const answer = record.answer ?? null;
  if (answer) records.delete(code);
  return response({ offer: record.offer, answer });
}

export async function POST(request: Request) {
  cleanExpired();
  let body: unknown;
  try { body = await request.json(); } catch { return response({ error: "Invalid request" }, 400); }
  if (!body || typeof body !== "object") return response({ error: "Invalid request" }, 400);
  const value = body as { action?: unknown; code?: unknown; offer?: unknown; answer?: unknown };

  if (value.action === "create" && validDescription(value.offer, "offer")) {
    let code = "";
    do code = String(Math.floor(100000 + Math.random() * 900000)); while (records.has(code));
    records.set(code, { offer: value.offer, expiresAt: Date.now() + TTL_MS });
    return response({ code, expiresIn: TTL_MS / 1000 }, 201);
  }

  if (value.action === "answer" && validCode(value.code) && validDescription(value.answer, "answer")) {
    const record = records.get(value.code);
    if (!record) return response({ error: "Pairing code expired or not found" }, 404);
    record.answer = value.answer;
    return response({ ok: true });
  }

  return response({ error: "Invalid pairing request" }, 400);
}
