# CCSE Prep 2026

Offline-first study app for the 300 official CCSE 2026 questions.

## What it includes

- Adaptive study mode with official answer grading.
- Exact CCSE mock composition: 10 / 3 / 2 / 3 / 7 questions across Tareas 1–5.
- Errors, progress, readiness criteria, and local study history.
- Installable PWA with IndexedDB persistence and cached app shell.
- Nearby one-shot sync over a direct WebRTC data channel. Pair by copying the offer and answer between devices; no account or database is required.
- JSON export/import as a fallback and backup.

The supplied `ccse-2026-questions.json` is immutable source data. The supplied Manual CCSE 2026 PDF is used for local explanatory context. AI providers cannot change official grading.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Terminal start-of-day gate

Install the CLI from this repository with `npm link`, then install the opt-in macOS Zsh gate:

```bash
npm link
zsh scripts/install-ccse-gate.zsh
```

The first interactive shell each day asks at least 10 CCSE questions before releasing the prompt. Press `J`, `K`, or `L` to choose A, B, or C. After question 10, press `Enter` to unlock or continue practicing. Non-interactive commands are not gated.

To remove the gate later:

```bash
npm run terminal:uninstall
```

Terminal answers are stored locally at `~/.local/share/ccse-prep/events.json`. Use Settings → Local Data → Import State to merge that file into the web app; export the web state and replace the terminal event log if you need the CLI to receive browser history.

## Verify

```bash
npm run validate:data
npm run lint
npm run typecheck
npm test -- --run
npm run build
```

## Nearby sync

On the first device, open `Progress → Sync Nearby → Create Sync Code`. Share the six-digit code with the second device. On the second device choose `Enter A Code`, enter the code, and confirm. The devices then connect directly and merge events by unique event ID.

The sync connection is direct and temporary. The signaling endpoint stores only the offer/answer metadata for up to five minutes; it does not store study history.

## Deployment

The app is a standard Next.js App Router project and can be deployed with:

```bash
vercel --prod
```

The production URL is `https://ccse-prep.vercel.app`.
