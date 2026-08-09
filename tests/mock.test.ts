import { describe, expect, it } from "vitest";
import { questions } from "@/data/questions";
import { makeMock, MOCK_COMPOSITION, MOCK_DURATION_MS, remainingMs, scoreMock } from "@/lib/mock";

describe("mock exams", () => {
  it("always creates the exact official composition", () => {
    for (let i = 0; i < 200; i++) {
      const mock = makeMock();
      expect(mock).toHaveLength(25);
      for (const task of [1, 2, 3, 4, 5] as const) expect(mock.filter((q) => q.task === task)).toHaveLength(MOCK_COMPOSITION[task]);
      expect(new Set(mock.map((q) => q.id)).size).toBe(25);
    }
  });
  it("scores unanswered questions as mistakes", () => {
    const mock = makeMock(() => 0.5, questions);
    const answers = Object.fromEntries(mock.slice(0, 15).map((q) => [q.id, q.answer]));
    const result = scoreMock(mock, answers, 1000, 0);
    expect(result.score).toBe(15);
    expect(result.mistakes).toHaveLength(10);
  });
  it("clamps the timer to zero at exactly 45 minutes", () => {
    expect(remainingMs(0, MOCK_DURATION_MS)).toBe(0);
    expect(remainingMs(0, MOCK_DURATION_MS + 5000)).toBe(0);
  });
});
