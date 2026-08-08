# External AI Full Context Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let learners send a complete, self-contained CCSE question prompt to ChatGPT or another installed AI app for deep explanations.

**Architecture:** Build the prompt from the immutable question bank, the learner's answer, the official answer, and all available manual chunks for the question's task. On Android/PWA, use the system share sheet so the learner can choose ChatGPT, Gemini, or another AI app; use clipboard copy as the fallback. Keep official grading inside CCSE Desk and treat external AI as an optional explanation tool.

**Tech Stack:** Next.js App Router, React, TypeScript, Web Share API, Clipboard API, Vitest.

---

### Task 1: Add the self-contained prompt builder

**Files:**
- Create: `src/lib/aiPrompt.ts`
- Test: `tests/aiPrompt.test.ts`

**Steps:**

1. Write a pure builder that includes the question, every option, selected answer, official answer, source page, and all supplied manual chunks.
2. Add explicit instructions for deep teaching, comparing options, identifying misconceptions, and asking a follow-up question.
3. Add tests proving every required field and manual chunk appears in the output.

### Task 2: Add external-AI sharing to study feedback

**Files:**
- Modify: `src/components/StudyView.tsx`

**Steps:**

1. Build the full prompt only after the question is submitted.
2. Add an `Ask AI With Full Context` button that invokes `navigator.share` when available.
3. Fall back to `navigator.clipboard.writeText` when sharing is unavailable, with an `aria-live` status message.
4. Keep the existing deterministic explanation and official grading unchanged.

### Task 3: Verify the feature

**Files:**
- Modify: `tests/ui.spec.ts` only if coverage needs a stable assertion.

**Steps:**

1. Run the focused prompt tests.
2. Run lint, typecheck, all unit tests, and production build.
3. Inspect the diff and confirm only scoped files are staged.

### Task 4: Commit and publish

**Steps:**

1. Commit the implementation and tests with an explicit file list.
2. Push `main` to `origin` without force.
3. Report the commit and remote result.
