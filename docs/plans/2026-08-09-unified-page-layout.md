# Unified Page Layout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Give every CCSE Prep screen a consistent page-content system while preserving the distinct study, mock, errors, and progress workflows.

**Architecture:** Keep `AppShell` as the shared route shell and add small presentational primitives for page headers, cards, section headings, and stat cards. Refactor each view to compose those primitives, using the existing CSS variables and semantic controls rather than introducing a new UI library.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, existing CSS custom properties.

---

### Task 1: Add shared page primitives

**Files:**
- Create: `src/components/PageLayout.tsx`

**Steps:**

1. Add typed `PageHeader`, `SectionHeading`, `SurfaceCard`, and `StatCard` components.
2. Use the existing design tokens, responsive spacing, focus-safe semantics, and concise copy defaults.

### Task 2: Refactor views onto the shared system

**Files:**
- Modify: `src/components/StudyView.tsx`
- Modify: `src/components/MockView.tsx`
- Modify: `src/components/MistakesView.tsx`
- Modify: `src/components/ProgressView.tsx`

**Steps:**

1. Replace ad hoc page headers and repeated surface classes with the shared primitives.
2. Preserve all existing state, persistence, navigation, and question-answer behavior.
3. Keep each workflow’s distinct composition: question focus for Study, timed exam for Mock, filtered ledger for Errors, and metrics/history for Progress.

### Task 3: Normalize shared styling details

**Files:**
- Modify: `src/app/globals.css`

**Steps:**

1. Add small shared layout utilities for consistent view entry and readable text measure.
2. Keep the current system typography, restrained surfaces, borders, motion, and reduced-motion behavior.

### Task 4: Verify

**Files:**
- Test: `tests/ui.spec.ts`

**Steps:**

1. Run the existing test suite and production build.
2. Review the diff for accidental behavior changes and report any environment-specific test limitations.
