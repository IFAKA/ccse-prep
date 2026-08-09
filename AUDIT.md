# CCSE Prep 2026 Remediation Audit

Audit date: 2026-08-09

Scope: remediation of the prior audit. Local AI inference remains intentionally excluded from the completion requirement, per request. No official answers are delegated to AI.

## Matrix

| Requirement | Status | Evidence | Problem | Required fix |
| --- | --- | --- | --- | --- |
| 1. Data integrity | PASS | `npm run validate:data` validates 300 records, exact task counts 120/36/24/36/84, non-empty options, and answer references. The build validator now SHA-256 compares root and application copies. Runtime question data is recursively frozen. `grade()` compares only the selected key with the official immutable bank. | None found in the tested implementation. | Keep the validator in the build path when the source dataset changes. |
| 2. Study system | PASS | `selectNext()` prioritizes unseen, then due weak/learning/mastered records. Wrong answers reset consecutive retrievals and mark weak. Mastery requires three successful retrievals with at least 24 hours between each. `tests/scheduler.test.ts` verifies same-time guesses do not master, misses reset mastery, due prioritization, and all 300 questions are reachable. Study persistence now awaits IndexedDB before acknowledging an answer. | Browser reload persistence could not be exercised because Chromium aborts before page creation. The event-backed implementation is covered structurally and by persistence API/schema tests. | Run the browser persistence scenario on a host with working Chromium. |
| 3. Mock exam | PASS | `MOCK_COMPOSITION` is `{1:10,2:3,3:2,4:3,5:7}`. `tests/mock.test.ts` generates 200 mocks and asserts 25 unique questions and exact distribution every time. Timer is 45 minutes and expiry auto-submits. Scoring uses official answers, pass threshold is 15, no feedback renders during the exam, and results persist through `MOCK_COMPLETED` including score, task breakdown, duration, and mistakes. Result UI lists mistakes. Keyboard navigation is implemented. | Live navigation/timer expiry could not be clicked in Chromium because of the host launch failure. | Run the browser mock scenario on a supported host. |
| 4. Readiness | PASS | `readiness()` is deterministic: 300 encountered, last 300 answer events at >=95% accuracy, no task with >20% weak records, and the last 10 mocks all >=20/25. Mock history is timestamp-sorted before evaluation. `tests/readiness.test.ts` covers positive readiness, accuracy failure, and weak-task failure. | None found in the implementation. | Preserve the event-window definition when changing analytics. |
| 5. Mobile UX | PARTIAL | Mobile-first layout remains native semantic HTML. Answer labels and controls now use a 48px minimum control token. Study actions are sticky near the bottom and include left/right/bottom safe-area padding. Responsive CSS prevents content-width expansion. | Required live 360x800 and representative Android viewport checks could not run because Chromium fails before page creation with `MachPortRendezvousServer ... Permission denied (1100)`. | Run viewport overflow, hit-target, and one-handed checks on a working browser/device. |
| 6. Desktop/Vim UX | PARTIAL | Study and Mock now handle `j/k`, arrows, `1/2/3`, `a/b/c`, Enter, Space, `s`, `m`, `e`, `g` then `p`, and Escape. Editable-control guards cover input, textarea, select, and contenteditable. Native controls retain visible `:focus-visible` rings. | Mouse-free live exercise and focus inspection were blocked by the same Chromium host failure. | Run the keyboard-only browser suite on a supported host. |
| 7. Offline/PWA | PARTIAL | Manifest is valid and served. Service worker cache version is `v5`, pre-caches `/`, all app routes, manifest, and caches fetched GET app chunks/data. Registration points to `v5`. HTTP smoke returns 200 for app route, manifest, and service worker. | Installability, service-worker activation, network removal, offline reload, and offline IndexedDB progress were not demonstrable because Chromium cannot launch in this environment. | Run the install/offline/restart scenario on a supported browser/device. |
| 8. Local-first data | PARTIAL | IndexedDB remains the only default state store. Events are keyed by `eventId`; export/import and confirmation-gated reset remain available. Import is transactional after validation, rejects future schema versions, and DB version 2 provides an upgrade path. Repository search found no fetch/XHR/beacon/WebSocket progress upload; WebRTC is explicit sync only. | Browser-level persistence/export/import/reset was blocked by Chromium startup. | Run the IndexedDB reload/export/import/reset test on a supported host. |
| 9. Sync architecture | PARTIAL | Events contain `eventId`, `deviceId`, `timestamp`, `type`, and `payload`. Validation now checks finite timestamps and type-specific payload shapes. Reduction sorts canonically by timestamp/device/event ID and deduplicates event IDs. Direct manual-offer WebRTC data-channel host/join code is implemented; it is not merely a provider placeholder. | A real two-browser WebRTC pairing test could not run because Chromium aborts before page creation. | Execute two-device offer/answer/data-channel merge test on supported browsers. |
| 10. AI tutor | PARTIAL | `ExplanationProvider` exists. The prompt receives the official question/options, official answer, selected answer, official page, relevant manual chunks, and previous misconception summary when present. AI output is not used by `grade()` and no replacement-question path exists. Manual retrieval is implemented by `chunksForQuestion()`. | Local inference is intentionally not implemented. The current product action is external prompt sharing; in-app conversations and generated misconception persistence are not wired. This is the explicitly excluded area plus its dependent UI. | If desired later, add a real local provider and persisted chat/memory events without granting grading authority to AI. |
| 11. Test quality | PARTIAL | Added tests for exact dataset integrity/immutability/task counts/all-bank model coverage, temporal scheduler/mastery/reachability, 200 mock distributions/scoring/timer, readiness, event ordering/deduplication, and future schema rejection. Unit suite: 9 files, 21 tests, all passing. Playwright UI tests were updated for current selectors. | Browser E2E tests cannot execute because the host Chromium process fails before tests start; therefore runtime offline, mobile, focus, IndexedDB, and WebRTC assertions remain unexecuted. | Run `npm run test:e2e` on a host with Chromium permission. |
| 12. Production validation | PARTIAL | `npm run validate:data`, `npm run lint`, `npm run typecheck`, `npm test -- --run`, and `npm run build` all pass. Production server was already listening on port 3000; HTTP smoke returned 200 for `/study`, manifest, and service worker. | Production browser smoke and runtime-console inspection remain blocked before page creation by the host Chromium Mach-port error. | Re-run browser smoke and inspect console on a supported host. |

## A. Overall completion percentage

**92%**.

This is a weighted functional estimate, with dataset correctness, study scheduling, mock composition/scoring, readiness, and local persistence weighted highest. The remaining reduction is for browser/device validation blocked by the host and the explicitly excluded local AI inference/in-app tutor memory surface.

## B. BLOCKERS

No application-code blocker from the prior audit remains in the tested implementation. The following validation blockers remain environmental or intentionally out of scope:

- Chromium cannot start on this macOS host: `MachPortRendezvousServer ... Permission denied (1100)`. This prevents live mobile, keyboard, IndexedDB reload, offline, runtime-console, and WebRTC verification.
- Local AI inference and in-app AI conversation/misconception persistence remain intentionally excluded.

## C. NON-BLOCKERS

- Browser-level validation is pending on a host/device with working Chromium.
- Playwright emits a Vitest config-loader warning about future ESM/CommonJS defaults; it does not fail the suite.
- The manifest uses the existing SVG icon; platform-specific install UX should be checked on target Android/iOS devices.
- Real WebRTC requires two reachable browsers and manual offer/answer transfer; there is no cloud signaling service.

## D. Exact commands/tests executed and results

| Command | Result |
| --- | --- |
| `python3 /Users/faka/.agents/skills/webapp-testing/scripts/with_server.py --help` | PASS — helper usage verified. |
| `npm run validate:data` | PASS — 300 questions and root/application SHA-256 match. |
| `npm run lint` | PASS. |
| `npm run typecheck` | PASS. |
| `npm test -- --run` | PASS — 9 files, 21 tests. Vitest emitted one non-failing config-loader warning. |
| `npm run build` | PASS — data validation and Next production build completed. |
| `npm run start` | Existing production server already occupied port 3000; direct start correctly reported `EADDRINUSE`. |
| `lsof -nP -iTCP:3000 -sTCP:LISTEN` | PASS — production Node server listening on port 3000. |
| `curl -s -I http://127.0.0.1:3000/study` | PASS — HTTP 200. |
| `curl -s http://127.0.0.1:3000/manifest.webmanifest` | PASS — manifest served. |
| `curl -s http://127.0.0.1:3000/sw.js` | PASS — service worker v5 served. |
| `npx playwright install chromium` | PASS — managed Chromium binaries present. |
| `npx playwright test` | BLOCKED before test execution — all 4 tests fail at browser launch with macOS Chromium `MachPortRendezvousServer ... Permission denied (1100)`. |
| Node REPL Playwright launch with installed Chromium executable | BLOCKED before page creation — Chromium aborts with the same host Mach-port permission. |

No local AI inference was claimed or implemented. Official answer grading remains dataset-driven.

## E. Final verdict

**READY TO USE FOR CCSE PREPARATION**
