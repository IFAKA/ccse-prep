#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import questionsData from "../src/data/ccse-2026-questions.json" with { type: "json" };
import { answerKeyForInput, canFinish, makeAnswerEvent, nextTerminalQuestion, terminalSummary } from "../src/lib/terminalQuiz.mjs";

const bank = questionsData.questions;
const dataDir = process.env.CCSE_DATA_DIR || join(homedir(), ".local", "share", "ccse-prep");
const eventLogPath = join(dataDir, "events.json");
const devicePath = join(dataDir, "terminal-device-id");

async function stableDeviceId() {
  await mkdir(dataDir, { recursive: true });
  try { return (await readFile(devicePath, "utf8")).trim(); } catch {}
  const id = `terminal-${randomUUID()}`;
  await writeFile(devicePath, `${id}\n`, { mode: 0o600 });
  return id;
}

async function appendEvent(event) {
  await mkdir(dataDir, { recursive: true });
  let events = [];
  try {
    const parsed = JSON.parse(await readFile(eventLogPath, "utf8"));
    if (Array.isArray(parsed.events)) events = parsed.events;
  } catch {}
  if (!events.some((current) => current.eventId === event.eventId)) events.push(event);
  await writeFile(eventLogPath, `${JSON.stringify({ schemaVersion: 2, events }, null, 2)}\n`, { mode: 0o600 });
}

function clearLine() { process.stdout.write("\x1b[2J\x1b[H"); }
function optionText(question, key) { return question.options[key] ?? ""; }

async function runQuiz() {
  const deviceId = await stableDeviceId();
  const answers = [];
  const usedIds = new Set();
  let question = nextTerminalQuestion(bank, usedIds);
  let startedAt = Date.now();
  let lastFeedback = "";
  let finished = false;
  let pendingWrites = Promise.resolve();
  let resolveExit;
  const exited = new Promise((resolve) => { resolveExit = resolve; });

  process.stdin.setRawMode?.(true);
  process.stdin.resume();
  const finish = () => {
    if (finished) return;
    finished = true;
    process.stdin.setRawMode?.(false);
    process.stdin.pause();
    process.stdout.write("\nTerminal unlocked.\n");
    resolveExit();
  };
  const onData = (rawKey) => {
    const key = rawKey.toLowerCase();
    if (key === "\u0003") { finish(); return; }
    if (key === "\r" || key === "\n") {
      if (canFinish(answers)) finish();
      else { lastFeedback = `Answer ${10 - answers.length} more question${answers.length === 9 ? "" : "s"} before pressing Enter.`; render(); }
      return;
    }
    const selected = answerKeyForInput(key);
    if (!selected || !question.options[selected]) return;
    const correct = selected === question.answer;
    const event = makeAnswerEvent({ questionId: question.id, selected, correct, responseMs: Date.now() - startedAt, eventId: randomUUID(), deviceId, timestamp: Date.now() });
    answers.push({ correct });
    pendingWrites = pendingWrites.then(() => appendEvent(event));
    usedIds.add(question.id);
    const summary = terminalSummary(answers);
    lastFeedback = `${correct ? "Correct" : `Not quite — answer ${question.answer.toUpperCase()}`} · ${summary.correct}/${summary.answered}`;
    question = nextTerminalQuestion(bank, usedIds);
    startedAt = Date.now();
    render();
  };
  const render = () => {
    clearLine();
    const summary = terminalSummary(answers);
    process.stdout.write(`CCSE Start Gate · ${summary.answered}/10 · ${summary.answered ? Math.round(summary.correct / summary.answered * 100) : 0}%\n\n`);
    process.stdout.write(`${question.question}\n\n`);
    process.stdout.write(`J  ${optionText(question, "a")}\nK  ${optionText(question, "b")}\nL  ${optionText(question, "c")}\n\n`);
    if (lastFeedback) process.stdout.write(`${lastFeedback}\n`);
    process.stdout.write(canFinish(answers) ? "Press J/K/L for another question, or Enter to unlock.\n" : "Press J, K, or L to answer.\n");
  };
  process.stdin.on("data", (chunk) => {
    // Raw input is intentionally handled byte-by-byte so J/K/L and Return work without line buffering.
    for (const key of String(chunk)) {
      if ((key === "\r" || key === "\n") && canFinish(answers)) { finish(); return; }
      try { onData(key); } catch { finish(); return; }
    }
  });
  render();
  await exited;
}

async function main() {
  if (process.argv.includes("--path")) { console.log(eventLogPath); return; }
  if (!process.stdin.isTTY) {
    process.stderr.write("CCSE start gate needs an interactive terminal.\n");
    process.exitCode = 2;
    return;
  }
  await runQuiz();
}

main().catch((error) => { process.stderr.write(`${error instanceof Error ? error.message : error}\n`); process.exitCode = 1; });
