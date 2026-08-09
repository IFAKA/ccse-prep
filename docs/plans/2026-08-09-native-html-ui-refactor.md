# Native HTML UI Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor the application UI to use semantic native HTML as its visual foundation, keeping only Next.js components required for framework behavior and React components required for state or interaction.

**Architecture:** Keep `AppShell` and the page views as React components, but remove generic visual primitives such as `SurfaceCard`, `SectionHeading`, and styling-only wrappers. Internal navigation continues to use Next.js `Link`; interactive controls render native `button`, `input`, `label`, `fieldset`, `dialog`, and form elements. `globals.css` remains global usability defaults, `ui.css` contains only layout exceptions, and `animations.css` remains the sole animation stylesheet.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, native HTML/CSS, Vitest, Playwright.

---

## Component audit and native equivalents

The refactor does not remove React where React owns state or behavior. It removes visual abstractions and makes those components return the correct native elements.

| Existing component | Decision | Native/framework output |
| --- | --- | --- |
| `AppShell` | Keep | Semantic `<header>`, Next.js `<Link>`, `<nav>`, `<main>`, `<footer>` |
| `PageHeader` | Simplify or inline | `<header>`, `<h1>`, `<p>` |
| `SectionHeading` | Remove | Native `<h2>`/`<h3>` and `<p>` |
| `SurfaceCard` | Remove | `<section>` or `<article>` |
| `StatCard` | Replace | `<dl>` with `<dt>` and `<dd>` |
| `StudyView` | Keep | Native `<section>`, `<button>`, `<dialog>` |
| `MockView` | Keep | Native `<section>`, `<button>`, `<fieldset>` where appropriate |
| `MistakesView` | Keep | `<fieldset>` with radio inputs for `All`, `Weak`, `Mastered`, and `Task 1` |
| `ProgressView` | Keep | `<section>`, `<dl>`, `<ul>`/`<ol>` |
| `SettingsView` | Keep | `<section>`, `<fieldset>`, native buttons and file input |
| `SoundToggle` | Keep | One native `<button aria-pressed>` |
| `SyncPanel` | Keep | `<section>`, `<form>`, `<fieldset>`, labeled `<textarea>` controls |
| `SplashScreen` | Keep | React visibility/timing plus semantic status region; retain animation classes |
| `CCSEMark` | Keep | Inline `<svg>` because it is a custom animated mark with no native HTML equivalent |

Specific semantic decisions:

- A filter where only one choice is active is a radio group, not a pill button.
- An immediate action such as `Check`, `Continue`, `Export State`, `Reset Local Data`, or `Create sync session` is a button.
- Answer options remain buttons because selection immediately updates question state and the app has keyboard shortcuts; they are not a form submission choice.
- Sound remains a button because it changes a preference and exposes pressed state.
- A custom visual mark may remain SVG; native HTML has no equivalent for arbitrary drawn artwork.
- Next.js `Link` remains required for internal navigation and should not be replaced with manually handled buttons or anchors.
- A native `<dialog>` is appropriate for the keyboard-shortcuts overlay, but its focus and close behavior must be implemented before replacing the current overlay.

---

### Task 1: Inventory component responsibilities and establish refactor boundaries

**Files:**
- Inspect: `src/components/*.tsx`
- Inspect: `src/app/*.tsx`
- Inspect: `src/app/globals.css`
- Inspect: `src/app/ui.css`
- Inspect: `src/app/animations.css`

**Step 1:** Classify each component as framework-required, behavior/state-required, animation-required, or styling-only.

Expected classification:

- Keep `AppShell` for route-aware navigation and shared page structure.
- Keep view components for state, persistence, and event handling.
- Keep `SoundToggle`, `SplashScreen`, `CCSEMark`, and question-counter logic where they own behavior or animation.
- Remove or simplify styling-only helpers in `PageLayout.tsx`, especially `SurfaceCard`, `SectionHeading`, and generic layout wrappers.
- Keep `next/link` and `next/navigation` usage where routing requires them.

**Step 2:** Record all class names used by JSX and mark which ones have actual layout or behavior value.

**Step 3:** Run the existing baseline checks.

Run: `npm run typecheck && npm run lint && npm test`

Expected: all existing checks pass before the refactor.

---

### Task 2: Convert the shared shell to semantic HTML while preserving Next.js routing

**Files:**
- Modify: `src/components/AppShell.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/ui.css`

**Step 1:** Keep `Link` for all internal routes and `usePathname` for active navigation state.

**Step 2:** Make the shell render a semantic `<header>`, `<nav>`, `<main>`, and `<footer>` structure. Remove unnecessary wrapper elements and decorative icon classes where text already identifies the destination.

**Step 3:** Keep the skip link and make the main target an actual `<main id="main-content">` rather than placing the ID on a generic wrapper.

**Step 4:** Keep one mobile navigation implementation unless the responsive markup genuinely needs two navigation regions. Ensure the fixed mobile navigation has an opaque `Canvas` background and that main content reserves bottom space.

**Step 5:** Reduce shell CSS to content width, responsive padding, navigation layout, and fixed-nav geometry only.

**Step 6:** Run `npm run typecheck && npm run lint`.

Expected: the shell remains route-correct and mobile navigation no longer shows content through its background or covers the last control.

---

### Task 3: Replace styling-only page primitives with semantic sections and headings

**Files:**
- Modify: `src/components/PageLayout.tsx`
- Modify: `src/components/StudyView.tsx`
- Modify: `src/components/MistakesView.tsx`
- Modify: `src/components/ProgressView.tsx`
- Modify: `src/components/MockView.tsx`
- Modify: `src/components/SettingsView.tsx`
- Modify: `src/components/SyncPanel.tsx`

**Step 1:** Replace `SurfaceCard` output with native `<section>` or `<article>` elements. Remove card borders, shadows, and padding unless they are required to distinguish an interactive region.

**Step 2:** Replace `SectionHeading` with native heading elements at the correct hierarchy (`h1`, `h2`, `h3`). Preserve `aria-labelledby` relationships where they communicate structure.

**Step 3:** Replace generic `native-stack`, `native-row`, and spacing-only wrappers with normal document flow. Keep a class only when the wrapper provides a real layout relationship such as a grid, aligned setting row, or responsive action group.

**Step 4:** Keep `StatCard` only if it provides meaningful semantic grouping; otherwise render native `<dl>`, `<dt>`, and `<dd>` elements for progress metrics.

**Step 5:** Keep `SyncPanel` as a behavior component, but use native `<section>`, `<label>`, `<textarea>`, and buttons. Ensure each textarea has an accessible label without relying on `aria-label` where visible label text is available.

**Step 6:** Run `npm run typecheck && npm run lint`.

Expected: pages retain their content and behavior while the DOM expresses hierarchy directly instead of through visual component names.

---

### Task 4: Use native form controls for study, mock, settings, and filtering interactions

**Files:**
- Modify: `src/components/StudyView.tsx`
- Modify: `src/components/MockView.tsx`
- Modify: `src/components/SettingsView.tsx`
- Modify: `src/components/MistakesView.tsx`
- Modify: `src/components/SoundToggle.tsx`

**Step 1:** Keep answer selection as native buttons if selecting an answer immediately changes application state; otherwise use a `<fieldset>` with radio inputs and labels. Do not add ARIA roles that duplicate native semantics.

**Step 2:** Keep `SoundToggle` as a React behavior component, but render one native `<button type="button" aria-pressed>` with stable one-line layout and a 44px target.

**Step 3:** Make export and reset native buttons.

**Step 4:** Make import a keyboard-operable labeled file input. Prefer a visible native file input first; if a styled label is retained, ensure the hidden input remains keyboard reachable or provide an equivalent focused button/input interaction.

**Step 5:** Keep filter controls as native buttons with `aria-pressed` only because they represent a toggle-like selection state.

**Step 6:** Preserve existing local-first behavior, IndexedDB updates, official answer data, and async status announcements.

**Step 7:** Run `npm run typecheck && npm run lint && npm test`.

Expected: all controls remain keyboard-operable, native in semantics, and visually usable without custom control components.

---

### Task 5: Minimize the CSS by responsibility

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/ui.css`
- Verify unchanged: `src/app/animations.css`

**Step 1:** Keep `globals.css` limited to box sizing, body margin and typography, minimum viewport width, inherited control typography, minimum button target, disabled state, and `:focus-visible`.

**Step 2:** Remove no-op selectors and classes from `ui.css`. Do not replace removed visual component styles with equivalent selectors under different names.

**Step 3:** Retain only layout rules that native HTML cannot supply:

- readable max-width and horizontal padding;
- page/header/nav geometry;
- responsive statistics grid;
- answer option layout;
- setting action alignment;
- mobile fixed-nav geometry and safe-area spacing;
- dialog/splash positioning;
- question-counter animation geometry.

**Step 4:** Keep all keyframes and motion rules in `animations.css`. Do not add animation declarations to `globals.css` or `ui.css`.

**Step 5:** Keep CSS readable and unminified. Record line and byte counts after the refactor.

Expected target:

- `globals.css`: approximately 25–35 readable lines;
- `ui.css`: approximately 80–130 readable lines;
- `animations.css`: unchanged except for necessary selector renames;
- no generic component-style CSS system.

---

### Task 6: Verify behavior and mobile layout

**Files:**
- Inspect: `tests/**`
- Inspect: Playwright configuration and relevant page tests
- Modify: tests only if semantic selectors require test updates

**Step 1:** Run `npm run typecheck`.

**Step 2:** Run `npm run lint`.

**Step 3:** Run `npm test`.

**Step 4:** Run `npm run build`.

**Step 5:** Run the existing Playwright suite with `npm run test:e2e` if the local browser setup is available.

**Step 6:** Inspect `/study`, `/errors`, `/progress`, `/settings`, and `/mock` at a narrow mobile viewport and a desktop viewport.

Verify specifically:

- the bottom navigation has an opaque background;
- the last page control is not hidden behind the bottom navigation;
- Import State has the same usable size and appearance as the other actions;
- Sound On/Off remains on one line or has an intentional responsive layout;
- headings and paragraphs retain readable native spacing;
- no content depends on a decorative card border to remain understandable;
- focus is visible and controls are at least 44px high;
- no animation rules moved out of `animations.css`.

**Step 7:** Remove any remaining styling-only classes and dead component exports found during verification.

**Step 8:** Run the complete validation set again and report the final readable CSS sizes.

Plan complete and saved to `docs/plans/2026-08-09-native-html-ui-refactor.md`.
