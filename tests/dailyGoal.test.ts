import { describe, expect, it } from "vitest";
import { blankState, makeEvent } from "@/lib/events";
import { dailyGoalProgress, daysUntilExam } from "@/lib/dailyGoal";

describe("dailyGoalProgress", () => {
  it("counts only answer events from the current local day", () => {
    const now = new Date(2026, 7, 9, 12, 0).getTime();
    const state = blankState();
    state.settings.dailyTarget = 2;
    state.events = [
      { ...makeEvent("ANSWER_RECORDED", { questionId: 1, correct: true }), timestamp: now - 86_400_000 },
      { ...makeEvent("ANSWER_RECORDED", { questionId: 2, correct: true }), timestamp: now - 60_000 },
      { ...makeEvent("MOCK_COMPLETED", { result: {} }), timestamp: now },
    ];

    expect(dailyGoalProgress(state, now)).toEqual({ answered: 1, target: 2, complete: false, streak: 0 });
  });

  it("marks the goal complete at or above the target", () => {
    const now = new Date(2026, 7, 9, 12, 0).getTime();
    const state = blankState();
    state.settings.dailyTarget = 2;
    state.events = [1, 2, 3].map((questionId) => ({
      ...makeEvent("ANSWER_RECORDED", { questionId, correct: true }),
      timestamp: now,
    }));

    expect(dailyGoalProgress(state, now)).toMatchObject({ answered: 3, target: 2, complete: true, streak: 1 });
  });

  it("counts consecutive completed local days", () => {
    const now = new Date(2026, 7, 9, 12, 0).getTime();
    const state = blankState();
    state.settings.dailyTarget = 1;
    state.events = [8, 9, 10].map((questionId, index) => ({
      ...makeEvent("ANSWER_RECORDED", { questionId, correct: true }),
      timestamp: now - index * 86_400_000,
    }));

    expect(dailyGoalProgress(state, now).streak).toBe(3);
  });

  it("calculates the exam countdown", () => {
    const now = new Date(2026, 7, 9, 12, 0).getTime();
    expect(daysUntilExam(now)).toBe(46);
  });
});
