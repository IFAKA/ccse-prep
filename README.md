# CCSE Desk 2026

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

## Verify

```bash
npm run validate:data
npm run lint
npm run typecheck
npm test -- --run
npm run build
```

## Nearby sync

On the first device, open `Progress → Sync Nearby → Create Sync Session`. Copy the offer code to the second device. On the second device choose `Join With a Code`, paste the offer, and copy the answer back. Paste the answer on the first device and connect. Events merge by unique event ID and the state is rebuilt locally on both devices.

The sync connection is direct and temporary. Vercel hosts the application only; it does not store study history.

## Deployment

The app is a standard Next.js App Router project and can be deployed with:

```bash
vercel --prod
```

The production URL is `https://ccse-prep.vercel.app`.
