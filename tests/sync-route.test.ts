import { describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/sync/route";

const offer = { type: "offer", sdp: "v=0\r\n" };
const answer = { type: "answer", sdp: "v=0\r\n" };

async function json(response: Response) {
  return await response.json() as Record<string, unknown>;
}

describe("numeric sync signaling", () => {
  it("creates a six-digit code and stores only the offer", async () => {
    const response = await POST(new Request("http://localhost/api/sync", { method: "POST", body: JSON.stringify({ action: "create", offer }) }));
    const payload = await json(response);
    expect(response.status).toBe(201);
    expect(payload.code).toMatch(/^\d{6}$/);
    const lookup = await GET(new Request(`http://localhost/api/sync?code=${payload.code}`));
    expect(await json(lookup)).toEqual({ offer, answer: null });
  });

  it("accepts an answer for a live code", async () => {
    const created = await json(await POST(new Request("http://localhost/api/sync", { method: "POST", body: JSON.stringify({ action: "create", offer }) })));
    const response = await POST(new Request("http://localhost/api/sync", { method: "POST", body: JSON.stringify({ action: "answer", code: created.code, answer }) }));
    expect(response.status).toBe(200);
    const lookup = await GET(new Request(`http://localhost/api/sync?code=${created.code}`));
    expect(await json(lookup)).toEqual({ offer, answer });
  });

  it("rejects malformed pairing requests", async () => {
    const response = await POST(new Request("http://localhost/api/sync", { method: "POST", body: JSON.stringify({ action: "answer", code: "123", answer }) }));
    expect(response.status).toBe(400);
  });
});
