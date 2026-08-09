"use client";

import { useEffect, useState } from "react";
import type { AppEvent, AppState } from "@/lib/types";
import { createHostSession, createJoinSession, type HostSession, type JoinSession } from "@/lib/sync";
import { mergeEvents } from "@/lib/storage";

type Mode = "idle" | "host" | "join";

export default function SyncPanel({ state, update }: { state: AppState; update: (state: AppState) => void }) {
  const [mode, setMode] = useState<Mode>("idle");
  const [code, setCode] = useState("");
  const [answer, setAnswer] = useState("");
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
      setCode(next.pairingCode);
      setMode("host");
      setMessage("Copy this offer to the other device. Paste its answer below.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not start sync");
    }
  };

  const join = async () => {
    try {
      const next = await createJoinSession(code, state.events, received);
      setSession(next);
      setAnswer(next.answerCode);
      setMode("join");
      setMessage("Copy this answer back to the device that created the session.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not join sync");
    }
  };

  const finish = async () => {
    if (!session || mode !== "host" || !("applyAnswer" in session)) return;
    try {
      await session.applyAnswer(answer);
      setMessage("Answer accepted. Waiting for the devices to connect…");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not accept answer");
    }
  };

  const close = () => {
    session?.close();
    setSession(undefined);
    setMode("idle");
    setCode("");
    setAnswer("");
  };

  return (
    <section className="nf-section">
      <header>
        <div>
          <h2>Sync nearby</h2>
          <p>One-time local transfer. No account or cloud database.</p>
        </div>
        {mode !== "idle" && <button type="button" onClick={close}>Close</button>}
      </header>

      {mode === "idle" && (
        <div>
          <div className="nf-cluster">
            <button className="nf-button-primary" type="button" onClick={host}>Create sync session</button>
            <button className="nf-button" type="button" onClick={() => setMode("join")}>Join with a code</button>
          </div>
        </div>
      )}

      {mode === "host" && (
          <form className="nf-form" onSubmit={(event) => { event.preventDefault(); void finish(); }}>
          <label className="nf-field">Offer code<textarea readOnly value={code} /></label>
          <label className="nf-field">Answer from other device<textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Paste answer here…" /></label>
          <button className="nf-button-primary" type="submit" disabled={!answer}>Connect devices</button>
        </form>
      )}

      {mode === "join" && (
          <form className="nf-form" onSubmit={(event) => { event.preventDefault(); void join(); }}>
          <label className="nf-field">Offer from other device<textarea value={code} onChange={(event) => setCode(event.target.value)} placeholder="Paste offer here…" /></label>
          <button className="nf-button-primary" type="submit" disabled={!code}>Create answer</button>
          {answer && <label className="nf-field">Answer code<textarea readOnly value={answer} /></label>}
        </form>
      )}

      {message && <p role="status" aria-live="polite">{message}</p>}
    </section>
  );
}
