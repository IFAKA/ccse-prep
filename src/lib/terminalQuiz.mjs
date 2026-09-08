import { due, recordAnswer, selectNext } from "./schedulerCore.mjs";

export const TERMINAL_MINIMUM = 10;

export function answerKeyForInput(input) {
  const key = String(input).toLowerCase();
  return key === "j" ? "a" : key === "k" ? "b" : key === "l" ? "c" : undefined;
}

export function terminalSummary(answers) {
  return {
    answered: answers.length,
    correct: answers.filter((answer) => answer.correct).length,
  };
}

function sessionStats(answers) {
  const summary = terminalSummary(answers);
  return { ...summary, accuracy: summary.answered ? summary.correct / summary.answered : 0, averageResponseMs: summary.answered ? Math.round(answers.reduce((total, answer) => total + (Number(answer.responseMs) || 0), 0) / summary.answered) : 0 };
}
export const terminalSessionSummary = sessionStats;

export function canFinish(answers) {
  return answers.length >= TERMINAL_MINIMUM;
}

export function nextTerminalQuestion(bank, usedIds) {
  return bank.find((question) => !usedIds.has(question.id)) ?? bank[0];
}

export function selectTerminalQuestion(bank, states, now = Date.now(), exclude = new Set()) {
  return selectNext(bank, states, now, exclude);
}

const statusOrder = { weak: 0, learning: 1, mastered: 2 };

/** Build a stable daily queue: no more than four scheduled reviews when the bank can supply fresh questions. */
export function buildSessionPlan(bank, states, now = Date.now(), sessionSize = TERMINAL_MINIMUM) {
  const available = [...bank];
  const unseen = available.filter((question) => !states[question.id] || states[question.id].status === "unseen");
  const dueReviews = available
    .filter((question) => states[question.id] && states[question.id].status !== "unseen" && due(states[question.id], now))
    .sort((a, b) => statusOrder[states[a.id].status] - statusOrder[states[b.id].status] || a.id - b.id);
  const size = Math.min(Math.max(0, sessionSize), available.length);
  const scheduledLimit = unseen.length >= Math.max(0, size - 4) ? Math.min(4, size) : size;
  const chosenReviews = dueReviews.slice(0, scheduledLimit);
  const chosenIds = new Set(chosenReviews.map((question) => question.id));
  const fresh = unseen.filter((question) => !chosenIds.has(question.id)).slice(0, size - chosenReviews.length);
  const plan = [...chosenReviews, ...fresh];
  if (plan.length < size) {
    for (const question of dueReviews) {
      if (plan.length >= size) break;
      if (!chosenIds.has(question.id)) { plan.push(question); chosenIds.add(question.id); }
    }
  }
  return plan;
}

export function reviewInterval(correct, state) {
  if (!correct) return 5;
  const next = state?.nextReviewAt;
  if (!next || !state?.lastSeenAt) return 0;
  return Math.max(0, Math.round((next - state.lastSeenAt) / (24 * 60 * 60 * 1000)));
}

export function terminalDashboardMetrics(bank, states, events = [], now = Date.now(), sessionAnswers = []) {
  const counts = { unseen: 0, learning: 0, weak: 0, mastered: 0, due: 0 };
  for (const question of bank) {
    const state = states[question.id];
    const status = state?.status ?? "unseen";
    counts[status] += 1;
    if (status !== "unseen" && due(state, now)) counts.due += 1;
  }
  const dates = new Set(events.filter((event) => event?.type === "ANSWER_RECORDED").map((event) => calendarDay(event.timestamp)));
  let streak = 0;
  let cursor = new Date(now);
  while (dates.has(calendarDay(cursor.getTime()))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
  const summary = sessionStats(sessionAnswers);
  return { ...counts, streak, dailyAnswered: [...events].filter((event) => event?.type === "ANSWER_RECORDED" && calendarDay(event.timestamp) === calendarDay(now)).length, dailyComplete: [...events].filter((event) => event?.type === "ANSWER_RECORDED" && calendarDay(event.timestamp) === calendarDay(now)).length >= TERMINAL_MINIMUM, sessionAccuracy: summary.accuracy, averageResponseMs: summary.averageResponseMs };
}

function calendarDay(timestamp) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function completionSummary(answers, beforeStates = {}, afterStates = {}) {
  const summary = sessionStats(answers);
  const newlyMastered = Object.keys(afterStates).filter((id) => afterStates[id]?.status === "mastered" && beforeStates[id]?.status !== "mastered").length;
  const weak = answers.filter((answer) => !answer.correct).length;
  return { ...summary, newlyMastered, weak, nextAction: newlyMastered ? "Keep the streak with a short review tomorrow." : weak ? "Review the weak questions while they are fresh." : "Come back tomorrow for the next gate." , unlockMessage: "Terminal unlocked." };
}

export function renderCompletionSummary(summary) {
  return `Score ${summary.correct}/${summary.answered} · ${Math.round(summary.accuracy * 100)}%\n${summary.newlyMastered} newly mastered · ${summary.weak} weak\n${summary.nextAction}\n${summary.unlockMessage}`;
}

export function reduceTerminalEvents(events) {
  return [...events]
    .filter((event) => event?.type === "ANSWER_RECORDED")
    .sort((a, b) => a.timestamp - b.timestamp || String(a.deviceId).localeCompare(String(b.deviceId)) || String(a.eventId).localeCompare(String(b.eventId)))
    .reduce(applyTerminalAnswer, {});
}

export function applyTerminalAnswer(states, event) {
  const questionId = Number(event.payload?.questionId);
  if (!Number.isFinite(questionId)) return states;
  states[questionId] = recordAnswer(states[questionId], Boolean(event.payload?.correct), event.timestamp, Number(event.payload?.responseMs) || 0);
  return states;
}

export function makeAnswerEvent({ questionId, selected, correct, responseMs, eventId, deviceId, timestamp }) {
  return {
    eventId,
    deviceId,
    timestamp,
    type: "ANSWER_RECORDED",
    payload: { questionId, answer: selected, correct, responseMs },
  };
}
