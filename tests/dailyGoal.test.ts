import { describe, expect, it } from "vitest";
import { blankState, makeEvent } from "@/lib/events";
import { dailyGoalProgress } from "@/lib/dailyGoal";

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

    expect(dailyGoalProgress(state, now)).toEqual({ answered: 1, target: 2, complete: false });
  });

  it("marks the goal complete at or above the target", () => {
    const now = new Date(2026, 7, 9, 12, 0).getTime();
    const state = blankState();
    state.settings.dailyTarget = 2;
    state.events = [1, 2, 3].map((questionId) => ({
      ...makeEvent("ANSWER_RECORDED", { questionId, correct: true }),
      timestamp: now,
    }));

    expect(dailyGoalProgress(state, now).complete).toBe(true);
  });
});
