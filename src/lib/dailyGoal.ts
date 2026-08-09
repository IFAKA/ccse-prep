import type { AppState } from "./types";

export type DailyGoalProgress = {
  answered: number;
  target: number;
  complete: boolean;
  streak: number;
};

export const EXAM_DATE = "24/09/2026";

function localDayKey(timestamp: number) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function localMidnight(timestamp: number) {
  const date = new Date(timestamp);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameLocalDay(timestamp: number, reference: Date) {
  const date = new Date(timestamp);
  return date.getFullYear() === reference.getFullYear()
    && date.getMonth() === reference.getMonth()
    && date.getDate() === reference.getDate();
}

export function dailyGoalProgress(state: AppState, now = Date.now()): DailyGoalProgress {
  const target = Math.max(1, state.settings.dailyTarget);
  const today = new Date(now);
  const answerEvents = state.events.filter((event) => event.type === "ANSWER_RECORDED");
  const answered = answerEvents.filter((event) => isSameLocalDay(event.timestamp, today)).length;
  const completedDays = answerEvents
    .map((event) => [localDayKey(event.timestamp), event.timestamp] as const)
    .reduce<Map<string, number>>((days, [key]) => days.set(key, (days.get(key) ?? 0) + 1), new Map());
  let streak = 0;
  let day = localMidnight(now);
  if ((completedDays.get(localDayKey(day.getTime())) ?? 0) < target) day.setDate(day.getDate() - 1);
  while ((completedDays.get(localDayKey(day.getTime())) ?? 0) >= target) {
    streak += 1;
    day.setDate(day.getDate() - 1);
  }

  return { answered, target, complete: answered >= target, streak };
}

export function daysUntilExam(now = Date.now()) {
  const today = localMidnight(now).getTime();
  const exam = new Date(2026, 8, 24).getTime();
  return Math.max(0, Math.ceil((exam - today) / 86_400_000));
}
