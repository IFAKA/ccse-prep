import { questions, type AnswerKey, type Question, type Task } from "@/data/questions";
import type { MockResult } from "./types";

export const MOCK_COMPOSITION: Record<Task, number> = { 1: 10, 2: 3, 3: 2, 4: 3, 5: 7 };
export const MOCK_DURATION_MS = 45 * 60 * 1000;
export const MOCK_PASS_SCORE = 15;

export function makeMock(random: () => number = Math.random, bank: readonly Question[] = questions): Question[] {
  return ([1, 2, 3, 4, 5] as Task[]).flatMap((task) =>
    bank.filter((question) => question.task === task).sort(() => random() - 0.5).slice(0, MOCK_COMPOSITION[task]),
  );
}

export function scoreMock(mock: readonly Question[], answers: Readonly<Record<number, AnswerKey>>, now: number, started: number): MockResult {
  const taskBreakdown = {} as MockResult["taskBreakdown"];
  const mistakes: number[] = [];
  for (const task of [1, 2, 3, 4, 5] as Task[]) {
    const taskQuestions = mock.filter((question) => question.task === task);
    taskBreakdown[task] = { total: taskQuestions.length, correct: taskQuestions.filter((question) => answers[question.id] === question.answer).length };
    taskQuestions.filter((question) => answers[question.id] !== question.answer).forEach((question) => mistakes.push(question.id));
  }
  return { id: crypto.randomUUID(), timestamp: now, score: Object.values(taskBreakdown).reduce((total, item) => total + item.correct, 0), taskBreakdown, mistakes, durationMs: Math.max(0, now - started) };
}

export function remainingMs(started: number, now: number) { return Math.max(0, MOCK_DURATION_MS - (now - started)); }
