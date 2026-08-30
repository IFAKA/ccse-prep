import { describe, expect, it } from "vitest";
import { answerKeyForInput, canFinish, terminalSummary } from "@/lib/terminalQuiz.mjs";

describe("terminal quiz", () => {
  it("maps j, k, and l directly to a, b, and c", () => {
    expect(answerKeyForInput("j")).toBe("a");
    expect(answerKeyForInput("K")).toBe("b");
    expect(answerKeyForInput("l")).toBe("c");
    expect(answerKeyForInput("x")).toBeUndefined();
  });

  it("requires ten completed answers but does not require correctness", () => {
    const answers = Array.from({ length: 9 }, (_, index) => ({ correct: index % 2 === 0 }));
    expect(canFinish(answers)).toBe(false);
    answers.push({ correct: false });
    expect(canFinish(answers)).toBe(true);
    expect(terminalSummary(answers)).toEqual({ answered: 10, correct: 5 });
  });
});
