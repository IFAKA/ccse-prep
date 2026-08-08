# CCSE 2026 Adaptive Offline Tutor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a mobile-first, offline-capable CCSE study tutor using the supplied 300-question bank and Manual CCSE 2026 as immutable sources of truth.

**Architecture:** Next.js App Router with a client-side study shell. Static question/manual data is validated at module load and build time; all mutable learning state is stored in IndexedDB and represented as mergeable events reduced by deterministic pure functions. A provider interface isolates future local LLM/native bridge integrations.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, Vitest, Playwright, native IndexedDB wrapper, PWA manifest/service worker.

---

### Task 1: Scaffold and validate the source data

**Files:** `package.json`, `tsconfig.json`, `next.config.ts`, `src/data/questions.ts`, `scripts/validate-data.mjs`, `tests/data.test.ts`

- Create the Next app tooling and test scripts.
- Import the supplied JSON without modifying it.
- Validate exactly 300 unique IDs, task counts, option shape, and answer membership.
- Fail the production build if validation fails.

### Task 2: Extract static manual knowledge and provider contracts

**Files:** `src/data/manualKnowledge.ts`, `src/lib/ai.ts`, `src/lib/manual.ts`, `tests/ai.test.ts`

- Extract relevant page text into static chunks keyed by task/page/topic; do not parse the PDF in the browser.
- Add disabled and deterministic mock explanation providers.
- Ensure providers can never mutate official answers.

### Task 3: Implement deterministic learning state and scheduler

**Files:** `src/lib/types.ts`, `src/lib/scheduler.ts`, `src/lib/readiness.ts`, `src/lib/events.ts`, `src/lib/storage.ts`, `tests/scheduler.test.ts`, `tests/events.test.ts`

- Define per-question state, settings, sessions, mocks, memory, and event envelopes.
- Implement scheduling priority, spacing, mastery reset, and readiness criteria as pure functions.
- Implement IndexedDB persistence with schema migration and import/export validation.

### Task 4: Build the study shell and adaptive study mode

**Files:** `src/app/page.tsx`, `src/app/globals.css`, `src/components/StudyView.tsx`, `src/components/AppShell.tsx`

- Add navigation between Study, Mock, Errors, and Progress.
- Implement one-question answer/feedback/continue flow with no pre-submit leakage.
- Add mobile touch targets, safe-area spacing, keyboard shortcuts, focus states, and shortcut help.

### Task 5: Build mock, mistakes, progress, and readiness views

**Files:** `src/components/MockView.tsx`, `src/components/MistakesView.tsx`, `src/components/ProgressView.tsx`

- Implement exact 10/3/2/3/7 composition, 45-minute timer, navigation, scoring, and persistence.
- Add all-missed filters and focused review.
- Show exact progress/readiness criteria and mock history without fake probability.

### Task 6: Add PWA, import/export, and test coverage

**Files:** `public/manifest.webmanifest`, `public/sw.js`, `src/components/SettingsView.tsx`, `tests/ui.spec.ts`

- Cache the offline shell and static assets.
- Add JSON export/import and confirmed reset.
- Run lint, typecheck, unit tests, UI tests, and production build; fix all failures.

