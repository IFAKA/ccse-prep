# CCSE 2026 Delivery Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Finish the CCSE 2026 phone/PWA tutor, add reliable nearby one-shot sync, improve public discoverability, publish the project to GitHub, and deploy it to Vercel.

**Architecture:** Keep all user data local-first as an append-only event log in IndexedDB. Nearby sync will exchange event JSON over a direct WebRTC data channel after a temporary six-digit signaling exchange; merging remains deterministic by event ID and the existing reducer. The signaling endpoint stores only connection metadata for a short TTL and never stores study data.

**Tech Stack:** Next.js App Router, TypeScript, IndexedDB, WebRTC DataChannel, temporary numeric signaling endpoint, Vitest, Playwright, GitHub CLI, Vercel CLI.

---

### Task 1: Close core correctness gaps

**Files:**
- Modify: `src/lib/scheduler.ts`
- Modify: `src/components/MockView.tsx`
- Test: `tests/scheduler.test.ts`

Steps:
1. Add failing tests for question-count spacing, mastery reset, and mock timer refresh behavior where practical.
2. Change wrong-answer scheduling to use an explicit session-question queue concept rather than pretending five days equals five intervening questions.
3. Preserve deterministic date-based spacing for persisted state and ensure a wrong answer after mastery returns the question to weak.
4. Make the mock timer tick independently once per second and auto-finish at zero.
5. Run unit tests, typecheck, lint, and build.

### Task 2: Add nearby sync protocol and UI

**Files:**
- Create: `src/lib/sync.ts`
- Create: `src/components/SyncPanel.tsx`
- Modify: `src/lib/storage.ts`
- Modify: `src/components/ProgressView.tsx`
- Modify: `src/lib/types.ts`
- Test: `tests/sync.test.ts`

Steps:
1. Test event-log validation, event ID deduplication, and deterministic merged reduction.
2. Implement a browser-only WebRTC session wrapper with offer creation, answer handling, ICE completion, one-time pairing token, and data-channel transfer.
3. Implement sync payload validation with size limits, schema checks, allowed event types, and clear error messages.
4. Add a Sync nearby panel with Create Sync Code, Enter A Code, pairing confirmation, transfer progress, imported-event count, and manual export/import fallback.
5. Ensure no user data is sent to a server and no official question answer can be changed by sync.
6. Run tests and build.

### Task 3: Finish product metadata and public documentation

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `public/manifest.webmanifest`
- Create: `public/robots.txt`
- Create: `public/sitemap.xml`
- Create: `README.md`
- Create: `public/icon.svg`

Steps:
1. Add Spanish/English title, description, keywords, Open Graph metadata, Twitter metadata, canonical metadata, viewport/theme metadata, and structured product copy.
2. Add installable PWA metadata and a simple app icon that matches the restrained phone UI.
3. Add robots and sitemap files with the final Vercel URL after deployment.
4. Document local-first privacy, sync behavior, source-of-truth data, commands, and deployment.

### Task 4: Verify the finished application

**Files:**
- Modify: `tests/ui.spec.ts` if selectors need updating

Steps:
1. Run `npm run validate:data`, `npm run lint`, `npm run typecheck`, `npm test -- --run`, and `npm run build`.
2. Run the local Playwright suite; if Chromium remains blocked by the environment, record that exact limitation and verify with the available browser path.
3. Inspect the production page and metadata locally.

### Task 5: Publish and deploy

Steps:
1. Initialize Git only after reviewing the complete file list and excluding build artifacts/secrets.
2. Commit logical changes with explicit paths.
3. Create a public GitHub repository with a short discoverable name such as `ccse-desk`, unless availability requires a documented alternative.
4. Push the reviewed main branch.
5. Check the desired Vercel project/domain name availability and deploy the production build.
6. Update sitemap/canonical URLs to the final Vercel domain, rerun build, commit, push, and redeploy.
7. Report repository URL, deployment URL, verification results, and any environment-limited test.
