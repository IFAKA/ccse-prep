import type { AnswerKey, Question } from "@/data/questions";
import type { QuestionState } from "./types";
export function emptyState(): QuestionState;
export function recordAnswer(previous: QuestionState | undefined, isCorrect: boolean, now?: number, responseMs?: number): QuestionState;
export function due(state: QuestionState | undefined, now?: number): boolean;
export function selectNext(questions: readonly Question[], states: Record<number, QuestionState>, now?: number, exclude?: ReadonlySet<number>): Question;
export function grade(question: Question, answer: AnswerKey): boolean;
