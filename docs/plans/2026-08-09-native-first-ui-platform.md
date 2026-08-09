# Native-First UI Platform Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Evolve the current app stylesheet into a production-oriented, native-first UI foundation that can support large applications without requiring a framework-specific component library.

**Architecture:** Keep semantic HTML as the public API. Organize CSS into tokens, native element defaults, layout patterns, and opt-in components. Add JavaScript only for interactions native HTML cannot provide, and validate the system through an explicit conformance lab and automated browser/accessibility tests.

**Tech Stack:** Next.js, React, TypeScript, CSS Cascade Layers, CSS custom properties, Vitest, Playwright.

---

### Task 1: Establish the stylesheet layers

**Files:**
- Create: `src/app/tokens.css`
- Modify: `src/app/globals.css`
- Modify: `src/app/ui.css`
- Modify: `src/app/layout.tsx`

**Steps:**

1. Define spacing, sizing, typography, color, border, and motion tokens in `tokens.css`.
2. Import the token file before the other styles.
3. Wrap styles in explicit cascade layers: reset, tokens, elements, patterns, components, utilities.
4. Replace repeated high-impact values with tokens without changing the visual direction.
5. Run `npm run lint` and `npm run typecheck`.

### Task 2: Add native element contracts

**Files:**
- Create: `src/app/elements.css`
- Modify: `src/app/layout.tsx`
- Test: `tests/ui-elements.test.ts`

**Steps:**

1. Define consistent behavior for buttons, links, form controls, fieldsets, tables, dialogs, and disclosure elements.
2. Preserve native semantics and browser behavior.
3. Guarantee focus-visible states and 44px interactive targets.
4. Add tests for required labels, focus selectors, and control sizing contracts.
5. Run `npm test`, `npm run lint`, and `npm run typecheck`.

### Task 3: Extract reusable layout patterns

**Files:**
- Create: `src/app/patterns.css`
- Modify: `src/app/ui.css`
- Modify: `src/components/PreviewView.tsx`
- Modify: `src/components/SettingsView.tsx`

**Steps:**

1. Add small semantic patterns: `stack`, `cluster`, `grid`, `toolbar`, `content-width`, and `flow`.
2. Replace page-structure selectors with these patterns where they improve reuse.
3. Keep layout patterns content-agnostic and mobile-safe.
4. Verify long labels, controls, and actions at narrow widths.
5. Run the existing test suite and production build.

### Task 4: Make navigation data-driven and recursively renderable

**Files:**
- Create: `src/components/Navigation.tsx`
- Modify: `src/components/AppShell.tsx`
- Create: `tests/navigation.test.tsx`

**Steps:**

1. Define a typed navigation tree with links and nested groups.
2. Render desktop and mobile navigation from the same data.
3. Support arbitrary nesting without duplicating markup for every level.
4. Preserve native links and disclosure controls.
5. Test active links, nested links, and mobile-safe wrapping.

### Task 5: Turn the scalability route into a conformance lab

**Files:**
- Modify: `src/components/ScalabilityView.tsx`
- Create: `src/components/ConformanceCheck.tsx`
- Modify: `src/app/ui.css`

**Steps:**

1. Group tests by layout, navigation, forms, content growth, data, and accessibility.
2. Add explicit instructions and expected results for every test.
3. Mark automated checks separately from manual checks.
4. Make horizontal table scrolling visibly intentional.
5. Include long text, nested content, empty states, error states, disabled states, and loading states.

### Task 6: Add browser and accessibility verification

**Files:**
- Create: `tests/e2e/scalability.spec.ts`
- Modify: `playwright.config.ts`
- Modify: `package.json`

**Steps:**

1. Test the lab at desktop and mobile viewport sizes.
2. Test keyboard navigation and visible focus.
3. Test that the page itself does not overflow horizontally.
4. Test that only intentionally scrollable regions can overflow.
5. Add accessibility checks for labels, headings, landmarks, and interactive names.
6. Run the browser suite in CI-compatible mode.

### Task 7: Document the public HTML API

**Files:**
- Create: `docs/ui-system.md`
- Create: `docs/components/`

**Steps:**

1. Document the native-first philosophy and enhancement boundaries.
2. Document tokens and layout patterns.
3. Document supported states and responsive expectations.
4. Document which patterns require JavaScript.
5. Link every documented pattern to a working example in the conformance lab.

### Task 8: Verify release readiness

**Files:**
- Modify: `package.json`
- Create: `CHANGELOG.md`

**Steps:**

1. Run lint, typecheck, unit tests, browser tests, data validation, and production build.
2. Check keyboard-only navigation, reduced motion, zoom, forced colors, and long content manually.
3. Record known limitations instead of claiming unsupported patterns are solved.
4. Establish a versioning and changelog policy.
