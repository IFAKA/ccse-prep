# Ten-Question Study Session Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make Study start with a fixed ten-question minimum, announce completion after the tenth answered question, keep allowing unlimited continuation, and avoid presenting the 300-question bank as a workload target.

**Architecture:** Keep the session count in `StudyView` because it describes the current study visit, not durable learning state. Derive completion from answered questions and render a live, semantic status notice without changing question-bank or IndexedDB behavior. Remove `/300` workload copy from Progress and readiness displays while keeping readiness thresholds and official data unchanged.

**Tech Stack:** Next.js, React, TypeScript, native HTML/CSS, Vitest, Playwright.

---

### Task 1: Add the session completion behavior

**Files:**
- Modify: `src/components/StudyView.tsx`

**Step 1:** Add a `SESSION_MINIMUM` constant and local `answeredInSession` state.

**Step 2:** Increment the count only after an answer event is successfully appended and reduced.

**Step 3:** Render a concise `Session complete` live notice once the count reaches ten, while leaving the existing `Continue` action enabled.

### Task 2: Remove the workload-style bank total

**Files:**
- Modify: `src/components/ProgressView.tsx`
- Modify: `src/lib/readiness.ts`

**Step 1:** Keep the seen count but display it without `/300`.

**Step 2:** Keep readiness thresholds intact but remove `/300` from the readiness detail copy as well.

### Task 3: Verify the behavior

**Files:**
- Test: `tests/ui.spec.ts`

**Step 1:** Add an end-to-end test that answers ten questions, checks the completion notice, and confirms Continue remains available.

**Step 2:** Run lint, typecheck, unit tests, and the relevant Playwright test.

### Task 4: Commit and push

**Step 1:** Review the diff and repository status.

**Step 2:** Stage only the changed feature, test, and plan files.

**Step 3:** Commit with a focused message and push the current `main` branch to its configured remote.
