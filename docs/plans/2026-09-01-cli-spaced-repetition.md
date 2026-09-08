# CLI Spaced Repetition Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the terminal start gate select questions with the same persisted spaced-repetition behavior as the web app.

**Architecture:** Extract the scheduler’s pure runtime logic into a JavaScript module usable by both browser TypeScript and the Node CLI. The CLI will reduce its local event log into question states, update those states after each answer, and select unseen/due/weak questions with the existing deterministic tie-breaker.

**Tech Stack:** TypeScript, Node ESM, Vitest, IndexedDB-compatible event schema.

---

### Task 1: Lock down adaptive CLI selection

**Files:**
- Modify: `tests/terminalQuiz.test.ts`
- Modify: `src/lib/terminalQuiz.mjs`

Write tests proving prior answer events produce the same priority order as the web scheduler and that current-session answers affect the next question.

### Task 2: Share scheduler logic

**Files:**
- Create: `src/lib/schedulerCore.mjs`
- Create: `src/lib/schedulerCore.d.mts`
- Modify: `src/lib/scheduler.ts`

Move the pure scheduling and answer-recording functions into a shared ESM core, preserving the web app’s current behavior and types.

### Task 3: Persist and consume CLI history

**Files:**
- Modify: `bin/ccse.mjs`

Load the existing event log before starting, reduce answer events into question states, select adaptively, and update in-memory states after each answer while continuing to append compatible events.

### Task 4: Verify

Run the focused terminal and scheduler tests, then the full test suite, typecheck, lint, and inspect the final diff.
