import { describe, expect, it } from "vitest";
import { blankState, reduceEvent, reduceEvents } from "@/lib/events";

const event = (id: string, timestamp: number, correct = true) => ({ eventId: id, deviceId: "test", timestamp, type: "ANSWER_RECORDED" as const, payload: { questionId: 1001, correct, responseMs: 10 } });

describe("event reduction", () => {
  it("deduplicates event ids", () => {
    const one = reduceEvent(blankState(), event("a", 1));
    expect(reduceEvent(one, event("a", 1)).events).toHaveLength(1);
  });
  it("is invariant to arrival order", () => {
    const ordered = [event("a", 0), event("b", 86400000), event("c", 172800000)];
    expect(reduceEvents(ordered).questionStates[1001]).toEqual(reduceEvents([...ordered].reverse()).questionStates[1001]);
    expect(reduceEvents(ordered).questionStates[1001].status).toBe("mastered");
  });
});
