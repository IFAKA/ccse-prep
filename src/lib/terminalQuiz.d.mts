export const TERMINAL_MINIMUM: number;
export function answerKeyForInput(input: unknown): "a" | "b" | "c" | undefined;
export function terminalSummary(answers: readonly { correct: boolean }[]): { answered: number; correct: number };
export function canFinish(answers: readonly unknown[]): boolean;
export function nextTerminalQuestion<T extends { id: number }>(bank: readonly T[], usedIds: ReadonlySet<number>): T;
export function makeAnswerEvent(input: { questionId: number; selected: string; correct: boolean; responseMs: number; eventId: string; deviceId: string; timestamp: number }): { eventId: string; deviceId: string; timestamp: number; type: "ANSWER_RECORDED"; payload: Record<string, unknown> };
