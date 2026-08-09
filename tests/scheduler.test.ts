import { describe, expect, it } from "vitest";
import { recordAnswer, selectNext } from "@/lib/scheduler";
import { questions } from "@/data/questions";

describe("scheduler", () => {
  it("requires separated correct retrievals and resets on a miss", () => {
    let s = recordAnswer(undefined, true, 0);
    expect(s.status).toBe("learning");
    s = recordAnswer(s, true, 86400000);
    expect(s.nextReviewAt).toBe(172800000);
    s = recordAnswer(s, true, 86400000 * 2);
    expect(s.status).toBe("mastered");
    s = recordAnswer(s, false, 86400000 * 3);
    expect(s.status).toBe("weak");
    expect(s.consecutiveCorrect).toBe(0);
  });
  it("does not grant mastery to same-time guesses", () => {
    let s = recordAnswer(undefined, true, 0);
    s = recordAnswer(s, true, 0);
    s = recordAnswer(s, true, 0);
    expect(s.status).toBe("learning");
  });
  it("prioritizes unseen, then due weak", () => {
    const now = 100000;
    const states = { 1001: { ...recordAnswer(undefined, false, now - 1), nextReviewAt: now - 1 }, 1002: recordAnswer(undefined, true, now) };
    expect(selectNext(questions, states, now).id).toBe(1003);
  });
  it("can reach every question without repeating the current item", () => {
    const states = {} as Record<number, ReturnType<typeof recordAnswer>>;
    const reached = new Set<number>();
    let current: number | undefined;
    for (let i = 0; i < questions.length; i++) {
      const next = selectNext(questions, states, i, current === undefined ? new Set() : new Set([current]));
      reached.add(next.id);
      states[next.id] = recordAnswer(states[next.id], true, i);
      current = next.id;
    }
    expect(reached.size).toBe(300);
  });
});
