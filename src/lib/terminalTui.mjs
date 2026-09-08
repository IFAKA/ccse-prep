import React, { useEffect, useMemo, useState } from "react";
import { Box, Text, useApp, useInput, useStdout } from "ink";
import { applyTerminalAnswer, buildSessionPlan, completionSummary, terminalDashboardMetrics, terminalSessionSummary } from "./terminalQuiz.mjs";

const h = React.createElement;
const DAY = 24 * 60 * 60 * 1000;

function Line({ children, ...props }) { return h(Text, props, children); }
function Bar({ answers, total, unicode, enabled }) {
  const width = 24;
  const correct = answers.filter((answer) => answer.correct).length;
  const incorrect = answers.length - correct;
  const correctWidth = Math.round((correct / Math.max(1, total)) * width);
  const incorrectWidth = Math.round((incorrect / Math.max(1, total)) * width);
  const remainingWidth = Math.max(0, width - correctWidth - incorrectWidth);
  const filled = unicode ? "█" : "#";
  const empty = unicode ? "░" : "-";

  return h(Line, null,
    h(Line, { color: colorRole(enabled, "green") }, filled.repeat(correctWidth)),
    h(Line, { color: colorRole(enabled, "red") }, filled.repeat(incorrectWidth)),
    h(Line, { color: colorRole(enabled, "white") }, empty.repeat(remainingWidth)),
    ` ${answers.length}/${total}`,
  );
}
function colorRole(enabled, role) { return enabled ? role : undefined; }

export function TerminalApp({ bank, states, events, deviceId, appendEvent, now = Date.now(), onDone }) {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const enabled = Boolean(stdout?.isTTY) && !process.env.NO_COLOR && process.env.TERM !== "dumb";
  const unicode = !process.env.CCSE_ASCII && process.env.TERM !== "dumb";
  const initialStates = useMemo(() => ({ ...states }), [states]);
  const [current, setCurrent] = useState(() => buildSessionPlan(bank, states, now)[0] ?? bank[0]);
  const [answers, setAnswers] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [startedAt, setStartedAt] = useState(now);
  const [completed, setCompleted] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!feedback || answers.length >= 10) return undefined;
    const timer = setTimeout(() => {
      const used = new Set(answers.map((item) => item.questionId));
      setCurrent(bank.find((question) => !used.has(question.id) && (!states[question.id] || states[question.id].status === "unseen")) ?? bank.find((question) => !used.has(question.id)) ?? bank[0]);
      setFeedback(null);
      setStartedAt(Date.now());
    }, 900);
    return () => clearTimeout(timer);
  }, [feedback, answers, bank, states]);

  const finish = () => {
    if (completed) { exit(); return; }
    if (answers.length < 10) { setMessage(`Answer ${10 - answers.length} more question${answers.length === 9 ? "" : "s"} before pressing Enter.`); return; }
    const summary = completionSummary(answers, initialStates, states);
    onDone?.(summary);
    setCompleted(true);
  };

  useInput((input, key) => {
    if (key.ctrl && input === "c") { exit(); return; }
    if (key.return) { finish(); return; }
    const answerKey = input === "j" ? "a" : input === "k" ? "b" : input === "l" ? "c" : undefined;
    if (!answerKey || !current?.options?.[answerKey] || answers.length >= 10) return;
    if (feedback) return;
    const timestamp = Date.now();
    const correct = answerKey === current.answer;
    const event = { eventId: `${deviceId}-${timestamp}-${current.id}-${answers.length}`, deviceId, timestamp, type: "ANSWER_RECORDED", payload: { questionId: current.id, answer: answerKey, correct, responseMs: Math.max(0, timestamp - startedAt) } };
    applyTerminalAnswer(states, event);
    appendEvent(event);
    const answer = { correct, responseMs: event.payload.responseMs, questionId: current.id };
    const nextAnswers = [...answers, answer];
    setAnswers(nextAnswers);
    setFeedback({ correct, selected: answerKey });
    setStartedAt(timestamp);
    setMessage("");
  });

  const summary = terminalSessionSummary(answers);
  const metrics = terminalDashboardMetrics(bank, states, events, now, answers);
  const total = 10;
  const optionLines = ["a", "b", "c"].filter((key) => current?.options?.[key]).map((key) => h(Line, { key, color: colorRole(enabled, feedback?.selected === key ? (feedback.correct ? "green" : "red") : undefined) }, `${key === "a" ? "J" : key === "b" ? "K" : "L"}  ${current.options[key]}`));
  if (completed) {
    const done = completionSummary(answers, initialStates, states);
    return h(Box, { flexDirection: "column", width: Math.min(stdout?.columns ?? 80, 96), paddingX: 1 },
      h(Line, { bold: true, color: colorRole(enabled, "cyan") }, "CCSE PREP · SESSION COMPLETE"),
      h(Line, { marginTop: 1, bold: true }, `Score ${done.correct}/${done.answered} · ${Math.round(done.accuracy * 100)}%`),
      h(Line, null, `${done.newlyMastered} newly mastered · ${done.weak} weak · ${done.averageResponseMs}ms average response`),
      h(Line, { marginTop: 1, color: colorRole(enabled, "green") }, "Terminal unlocked."),
      h(Line, null, done.nextAction),
      h(Line, { marginTop: 1, color: colorRole(enabled, "white") }, "Press Enter to close · Ctrl-C Exit")
    );
  }
  return h(Box, { flexDirection: "column", width: Math.min(stdout?.columns ?? 80, 96), paddingX: 1 },
    h(Box, { justifyContent: "space-between" }, h(Line, { bold: true, color: colorRole(enabled, "cyan") }, "CCSE PREP"), h(Line, { color: colorRole(enabled, "white") }, `Gate ${summary.answered}/${total} · ${Math.round(summary.accuracy * 100)}% · ${metrics.streak} day streak`)),
    h(Line, { color: colorRole(enabled, "black") }, "────────────────────────────────────────────────────────"),
    h(Box, { justifyContent: "space-between" }, h(Line, null, `Due ${metrics.due}  ·  Weak ${metrics.weak}  ·  Learning ${metrics.learning}  ·  Mastered ${metrics.mastered}`), h(Line, { color: colorRole(enabled, "yellow") }, `Exam ${Math.max(0, Math.ceil((new Date("2026-11-03").getTime() - now) / DAY))}d`)),
    h(Box, { marginTop: 1, flexDirection: "column" }, h(Line, { color: colorRole(enabled, "white") }, `Task ${current?.task ?? "—"} · Question ${summary.answered + 1} of ${total}`), h(Line, { bold: true }, current?.question ?? "No questions available."), ...optionLines),
    h(Box, { marginTop: 1 }, h(Bar, { answers, total, unicode, enabled })),
    message && h(Line, { marginTop: 1, color: colorRole(enabled, "yellow") }, message),
    h(Line, { marginTop: 1, color: colorRole(enabled, "white") }, summary.answered >= total ? "Press Enter to unlock · J/K/L to keep reviewing" : "J/K/L Select Answer · Enter Unlocks After 10 · Ctrl-C Exit")
  );
}

export async function runTerminalTui(options) {
  const { render } = await import("ink");
  return new Promise((resolve) => {
    const instance = render(h(TerminalApp, { ...options, onDone: (summary) => options.onDone?.(summary) }), { exitOnCtrlC: false });
    instance.waitUntilExit().then(() => resolve(undefined));
  });
}
