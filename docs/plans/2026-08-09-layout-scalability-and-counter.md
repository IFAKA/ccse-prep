# Layout Scalability and Counter Animation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the minimal CCSE Prep interface visually stable on desktop and mobile, clarify the submitted-answer state, keep controls usable at small widths, and restore the question-number digit animation.

**Architecture:** Keep the existing semantic HTML and native browser styling. Add only small layout rules and one reusable action-group pattern; keep primary navigation in `AppShell`, page-specific sections inside their pages, and use a native text-based overflow menu only if the number of top-level destinations grows. The animated counter will keep Motion for state transitions and use CSS only to clip and stack the digits correctly.

**Tech Stack:** Next.js, React, TypeScript, native HTML/CSS, Motion, Vitest, Playwright.

---

### Task 1: Normalize product naming

**Files:**
- Modify: `src/components/AppShell.tsx:44-48`
- Modify: `README.md:1`
- Verify: `src/app/layout.tsx` and `src/components/SplashScreen.tsx`

**Step 1: Identify the visible product-name sources**

Confirm that the header and README still say `CCSE Desk`, while metadata and the splash already say `CCSE Prep 2026`.

**Step 2: Replace the visible header name**

Change the header brand from `CCSE Desk` to `CCSE Prep`, preserving the existing semantic `<strong>` element and navigation structure.

**Step 3: Align documentation naming**

Change the README heading to use the same product name. Do not alter metadata because it already uses the intended `CCSE Prep 2026` name.

**Step 4: Run static checks**

Run: `npm run lint && npm run typecheck`

Expected: both commands pass.

---

### Task 2: Center the header brand and navigation controls

**Files:**
- Modify: `src/app/ui.css:35-65`

**Step 1: Reproduce the current alignment behavior**

Open `/study` at desktop width and a 375px mobile viewport. Confirm that the navigation anchor’s 44px minimum height makes its text sit on a different baseline from the brand.

**Step 2: Make each navigation link a centered flex control**

Keep the existing 44px hit target, but make `.main-nav a` a flex container with centered cross-axis alignment. Preserve wrapping and the existing native link appearance.

**Step 3: Preserve mobile wrapping**

Keep `.site-header` and `.main-nav` wrapping. Do not introduce a hamburger menu while there are only five primary destinations.

**Step 4: Verify keyboard and viewport behavior**

Check that every link remains reachable by keyboard, has the existing `:focus-visible` outline, and does not overlap when the viewport is 320px wide.

---

### Task 3: Fix the animated question counter

**Files:**
- Modify: `src/app/ui.css:after .textarea rules`
- Verify: `src/components/StudyView.tsx:15-77`

**Step 1: Confirm the failure mode**

The Motion track renders two stacked values during a digit change. Without CSS that makes each digit a clipped one-character viewport and each track a vertical column, both values render inline, producing output such as `10034`.

**Step 2: Add the minimal counter viewport rules**

Add rules that:

- keep `Question` and the digits aligned on the same baseline;
- render the digit group inline;
- give each digit a one-character clipped viewport;
- stack the two track values vertically;
- give each track value one digit-height line box.

Do not change the Motion transition values or add decorative styling.

**Step 3: Verify unchanged and changed digits**

Load `/study` with a question whose id contains repeated and changing digits. Advance through questions and confirm:

- unchanged digits remain still;
- changed digits slide vertically;
- only one digit is visible per position;
- no concatenated values such as `10034` appear;
- the accessible `aria-label` still announces the full question number.

**Step 4: Verify reduced motion**

With `prefers-reduced-motion: reduce`, confirm that the counter displays only the final value without animation or duplicate digits.

---

### Task 4: Separate submitted-answer feedback from the question

**Files:**
- Modify: `src/app/ui.css`
- Verify: `src/components/StudyView.tsx:244-283`

**Step 1: Reproduce the submitted state**

Answer a question and inspect the area below the fieldset. Confirm that the result, AI action, explanatory copy, and Continue action read as one undifferentiated block.

**Step 2: Add a minimal feedback boundary**

Use the existing `.feedback` wrapper to add only spacing and a subtle top border. Keep the current correct/wrong classes and native colors; do not turn the feedback into a card.

**Step 3: Keep the primary action separate**

Retain Continue in the existing footer, with enough separation from feedback that it reads as the next-step action.

**Step 4: Verify status semantics**

Confirm that the existing `aria-live="polite"` feedback remains intact and that the layout works for both correct and incorrect answers.

---

### Task 5: Make Settings action groups mobile-safe

**Files:**
- Modify: `src/components/SettingsView.tsx:38-49`
- Modify: `src/app/ui.css`

**Step 1: Reproduce the narrow layout**

Open `/settings` at 375px and inspect the Export, Import, file picker, Reset, and sync controls. Confirm that inline native file controls can visually collide with neighboring actions.

**Step 2: Add a semantic action-group class**

Wrap the local data actions in a named container and keep the file input inside its label. Use a single reusable class for groups of related actions rather than styling each button individually.

**Step 3: Add minimal wrapping rules**

Make the group a flex layout with a consistent gap and wrapping. At the narrow breakpoint, allow the controls to stack naturally without reducing their 44px hit targets or forcing arbitrary fixed widths.

**Step 4: Verify the settings workflow**

At 320px, 375px, and desktop widths, confirm that Export State, Import State, Choose File, Reset Local Data, and sync actions remain readable, separated, and keyboard-operable.

---

### Task 6: Establish the scalable navigation boundary

**Files:**
- Modify only if required: `src/components/AppShell.tsx`
- Modify only if required: `src/app/ui.css`

**Step 1: Keep the current five links as primary navigation**

Do not add a mega menu or mobile hamburger yet. The current navigation is small enough to remain visible and text-only.

**Step 2: Define the escalation rule**

When additional destinations are needed, keep the most-used 3–5 routes in the primary nav and group low-frequency destinations under a native `<details>` control labeled `More`. Use text labels, not icons.

**Step 3: Keep sub-items local to their feature**

If Progress, Settings, or another area gains subsections, add local headings or a page-level navigation inside that view rather than expanding the global header.

**Step 4: Keep component boundaries explicit**

Reuse the existing `PageHeader`. If repeated patterns grow, extract only the patterns that have at least two real consumers: metric grid, action group, feedback panel, or local section navigation.

---

### Task 7: Verify the complete change set

**Files:**
- Test: existing `tests/*.test.ts`
- Test: existing Playwright configuration and e2e tests, if present

**Step 1: Run unit tests**

Run: `npm test`

Expected: all existing Vitest tests pass.

**Step 2: Run lint and type checks**

Run: `npm run lint && npm run typecheck`

Expected: both commands pass with no new diagnostics.

**Step 3: Run the production build**

Run: `npm run build`

Expected: data validation and Next.js production build pass.

**Step 4: Perform browser verification**

Verify `/study`, `/mock`, `/errors`, `/progress`, and `/settings` at 320px, 375px, and desktop widths. Check header alignment, answer feedback, metrics, button wrapping, counter transitions, splash naming, focus-visible states, and reduced motion.

**Step 5: Review the diff for scope**

Confirm that the implementation contains only the minimal layout rules required for the issues above and does not reintroduce decorative icons, footer navigation, or a large design system.
