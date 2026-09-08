#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import questionsData from "../src/data/ccse-2026-questions.json" with { type: "json" };
import { runTerminalTui } from "../src/lib/terminalTui.mjs";
import { reduceTerminalEvents } from "../src/lib/terminalQuiz.mjs";

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

async function loadEvents() {
  try {
    const parsed = JSON.parse(await readFile(eventLogPath, "utf8"));
    return Array.isArray(parsed.events) ? parsed.events : [];
  } catch {
    return [];
  }
}

async function runQuiz() {
  const deviceId = await stableDeviceId();
  const events = await loadEvents();
  const states = reduceTerminalEvents(events);
  await runTerminalTui({ bank, states, events, deviceId, appendEvent, now: Date.now() });
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
