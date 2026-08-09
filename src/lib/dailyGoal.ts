import type { AppState } from "./types";

export type DailyGoalProgress = {
  answered: number;
  target: number;
  complete: boolean;
};

function isSameLocalDay(timestamp: number, reference: Date) {
  const date = new Date(timestamp);
  return date.getFullYear() === reference.getFullYear()
    && date.getMonth() === reference.getMonth()
    && date.getDate() === reference.getDate();
}

export function dailyGoalProgress(state: AppState, now = Date.now()): DailyGoalProgress {
  const target = Math.max(1, state.settings.dailyTarget);
  const today = new Date(now);
  const answered = state.events.filter((event) =>
    event.type === "ANSWER_RECORDED" && isSameLocalDay(event.timestamp, today),
  ).length;

  return { answered, target, complete: answered >= target };
}
