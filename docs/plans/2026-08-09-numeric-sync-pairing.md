# Numeric Sync Pairing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace bulky QR/manual SDP exchange with a temporary six-digit pairing code that establishes direct WebRTC sync.

**Architecture:** A short-lived Next.js route stores only the offer/answer signaling metadata in process memory for a few minutes. The browser uses the numeric code to exchange that metadata, then transfers study events directly over the existing WebRTC data channel. The signaling record is deleted after the answer is retrieved or expires.

**Tech Stack:** Next.js App Router route handlers, TypeScript, WebRTC, IndexedDB-backed event log, native HTML forms.

---

### Task 1: Add temporary signaling storage

**Files:**
- Create: `src/app/api/sync/route.ts`
- Test: `tests/sync-route.test.ts`

Implement create, read, and answer operations with six-digit codes, strict payload validation, and a five-minute expiry. Store no study events.

### Task 2: Replace SDP payload exchange

**Files:**
- Modify: `src/lib/sync.ts`

Publish offers and answers through `/api/sync`, poll for the answer on the host, and preserve direct WebRTC event transfer and validation.

### Task 3: Remove QR and manual code UI

**Files:**
- Modify: `src/components/SyncPanel.tsx`
- Modify: `src/app/native-first-ui/components.css`

Use native numeric input and concise status copy. Show the host code, let the joining device enter and confirm it, and report connection/transfer status with `aria-live`.

### Task 4: Validate

Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`.
