"use client";

import { useEffect, useState } from "react";
import type { AppEvent, AppState } from "@/lib/types";
import { createHostSession, createJoinSession, type HostSession, type JoinSession } from "@/lib/sync";
import { mergeEvents } from "@/lib/storage";

type Mode = "idle" | "host" | "join";

export default function SyncPanel({ state, update }: { state: AppState; update: (state: AppState) => void }) {
  const [mode, setMode] = useState<Mode>("idle");
  const [pairingCode, setPairingCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [message, setMessage] = useState("");
  const [session, setSession] = useState<HostSession | JoinSession>();

  useEffect(() => () => session?.close(), [session]);

  const received = async (events: AppEvent[]) => {
    const before = state.events.length;
    const next = await mergeEvents(events);
    update(next);
    setMessage(`${Math.max(0, next.events.length - before)} new events received. Study history merged.`);
  };

  const host = async () => {
    try {
      const next = await createHostSession(state.events, received);
      setSession(next);
      setPairingCode(next.pairingCode);
      setMode("host");
      setMessage("Share this six-digit code. Waiting for the other device to confirm.");
      void next.waitForAnswer().then(() => setMessage("Devices connected. Syncing study history…")).catch((error: unknown) => {
        if (error instanceof Error && error.message !== "Sync session closed") setMessage(error.message);
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not start sync");
    }
  };

  const join = async () => {
    try {
      const next = await createJoinSession(joinCode, state.events, received);
      setSession(next);
      setMode("join");
      setMessage("Pairing confirmed. Connecting devices…");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not join sync");
    }
  };

  const close = () => {
    session?.close();
    setSession(undefined);
    setMode("idle");
    setPairingCode("");
    setJoinCode("");
    setMessage("");
  };

  return (
    <section className="nf-section">
      <header>
        <div>
          <h2>Sync Nearby</h2>
          <p>One-time local transfer. No account or cloud database.</p>
        </div>
        {mode !== "idle" && <button type="button" onClick={close}>Close</button>}
      </header>

      {mode === "idle" && (
        <div className="nf-cluster">
          <button className="nf-button-primary" type="button" onClick={() => void host()}>Create Sync Code</button>
          <button className="nf-button" type="button" onClick={() => setMode("join")}>Enter A Code</button>
        </div>
      )}

      {mode === "host" && (
        <div className="sync-pairing nf-card">
          <p><strong>Share This Code</strong></p>
          <output className="sync-pairing-code" aria-label="Six-digit sync code">{pairingCode}</output>
          <p className="nf-help">The other device enters this code to confirm the pairing. The code expires in five minutes.</p>
        </div>
      )}

      {mode === "join" && (
        <form className="nf-form" onSubmit={(event) => { event.preventDefault(); void join(); }}>
          <label className="nf-field">
            <span>Six-Digit Sync Code</span>
            <input
              value={joinCode}
              onChange={(event) => setJoinCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              pattern="[0-9]{6}"
              autoComplete="one-time-code"
              placeholder="000000"
              maxLength={6}
              required
            />
          </label>
          <p className="nf-help">Enter the code shown on the other device to confirm this one-time connection.</p>
          <button className="nf-button-primary" type="submit" disabled={joinCode.length !== 6}>Confirm And Connect</button>
        </form>
      )}

      {message && <p role="status" aria-live="polite">{message}</p>}
    </section>
  );
}
