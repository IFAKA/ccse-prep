import { describe, expect, it } from "vitest";
import { questions } from "@/data/questions";

describe("official bank", () => {
  it("has exactly 300 unique, non-empty questions with valid immutable answers", () => {
    expect(questions).toHaveLength(300);
    expect(new Set(questions.map((q) => q.id)).size).toBe(300);
    expect(new Set(questions.map((q) => q.question)).size).toBe(300);
    expect(Object.isFrozen(questions)).toBe(true);
    for (const q of questions) {
      expect(q.question.trim()).not.toBe("");
      expect(q.options.a?.trim()).toBeTruthy();
      expect(q.options.b?.trim()).toBeTruthy();
      expect(q.options[q.answer]?.trim()).toBeTruthy();
    }
  });
  it("has the official task distribution", () => {
    const counts = questions.reduce((result, q) => ({ ...result, [q.task]: result[q.task] + 1 }), { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    expect(counts).toEqual({ 1: 120, 2: 36, 3: 24, 4: 36, 5: 84 });
  });
  it("renders every bank item through the question model", () => {
    for (const question of questions) expect(Object.keys(question.options)).toEqual(expect.arrayContaining(["a", "b"]));
  });
});
