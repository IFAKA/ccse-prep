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

export function canFinish(answers) {
  return answers.length >= TERMINAL_MINIMUM;
}

export function nextTerminalQuestion(bank, usedIds) {
  return bank.find((question) => !usedIds.has(question.id)) ?? bank[0];
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
