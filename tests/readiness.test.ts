import { describe, expect, it } from "vitest";
import { questions } from "@/data/questions";
import { blankState } from "@/lib/events";
import { readiness } from "@/lib/readiness";

function fixture(wrongCount = 0) {
  const state = blankState();
  state.questionStates = Object.fromEntries(questions.map((question) => [question.id, { attempts: 1, correct: 1, incorrect: 0, consecutiveCorrect: 1, status: "learning" as const }]));
  state.events = Array.from({ length: 300 }, (_, index) => ({ eventId: `answer-${index}`, deviceId: "test", timestamp: index + 1, type: "ANSWER_RECORDED" as const, payload: { questionId: questions[index % questions.length].id, correct: index >= wrongCount } }));
  state.mockHistory = Array.from({ length: 10 }, (_, index) => ({ id: `mock-${index}`, timestamp: 1000 - index, score: 20, mistakes: [], durationMs: 1, taskBreakdown: { 1: { correct: 10, total: 10 }, 2: { correct: 3, total: 3 }, 3: { correct: 2, total: 2 }, 4: { correct: 3, total: 3 }, 5: { correct: 7, total: 7 } } }));
  return state;
}

describe("readiness", () => {
  it("is ready only when every condition is met", () => expect(readiness(fixture(), questions).ready).toBe(true));
  it("uses the recent answer window and rejects an accuracy miss", () => expect(readiness(fixture(16), questions).conditions[1].met).toBe(false));
  it("rejects a weak task", () => { const state = fixture(); for (const question of questions.filter((q) => q.task === 1).slice(0, 25)) state.questionStates[question.id].status = "weak"; expect(readiness(state, questions).ready).toBe(false); });
});
