import { describe, expect, it } from "vitest";
import { answerKeyForInput, canFinish, reduceTerminalEvents, selectTerminalQuestion, terminalSummary } from "@/lib/terminalQuiz.mjs";
import { questions } from "@/data/questions";

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

  it("uses persisted answers to prioritize unseen and due weak questions", () => {
    const now = 100000;
    const events = [
      { eventId: "weak", deviceId: "terminal", timestamp: now - 1, type: "ANSWER_RECORDED", payload: { questionId: 1001, correct: false, responseMs: 10 } },
      { eventId: "learning", deviceId: "terminal", timestamp: now, type: "ANSWER_RECORDED", payload: { questionId: 1002, correct: true, responseMs: 10 } },
    ];
    const states = reduceTerminalEvents(events);
    expect(selectTerminalQuestion(questions, states, now).id).toBe(1003);
    expect(selectTerminalQuestion(questions.slice(0, 2), states, now, new Set([1002])).id).toBe(1001);
  });

  it("updates the schedule when a current-session answer is recorded", () => {
    const states = reduceTerminalEvents([]);
    const next = selectTerminalQuestion(questions, states, 0);
    expect(next.id).toBe(1001);
    states[next.id] = reduceTerminalEvents([
      { eventId: "answer", deviceId: "terminal", timestamp: 0, type: "ANSWER_RECORDED", payload: { questionId: next.id, correct: true, responseMs: 10 } },
    ])[next.id];
    expect(selectTerminalQuestion(questions, states, 0, new Set([next.id])).id).toBe(1002);
  });
});
