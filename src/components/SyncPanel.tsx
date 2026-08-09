"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { BrowserQRCodeReader } from "@zxing/browser";
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
  const [qrCode, setQrCode] = useState("");
  const [answerQrCode, setAnswerQrCode] = useState("");
  const [copied, setCopied] = useState<"offer" | "answer" | "">("");
  const [scanOpen, setScanOpen] = useState(false);
  const [scanTarget, setScanTarget] = useState<"offer" | "answer">("offer");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => () => session?.close(), [session]);

  useEffect(() => {
    if (!scanOpen || !videoRef.current) return;
    const reader = new BrowserQRCodeReader();
    let controls: { stop: () => void } | undefined;
    let cancelled = false;

    void reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
      if (cancelled || !result) return;
      if (scanTarget === "offer") setCode(result.getText());
      else setAnswer(result.getText());
      setScanOpen(false);
      setMessage(scanTarget === "offer" ? "Offer scanned. Review it, then create the answer." : "Answer scanned. Review it, then connect the devices.");
      controls?.stop();
    }).then((nextControls) => {
      controls = nextControls;
      if (cancelled) controls.stop();
    }).catch(() => {
      if (!cancelled) setMessage("Camera access was unavailable. Paste the offer code instead.");
    });

    return () => {
      cancelled = true;
      controls?.stop();
    };
  }, [scanOpen, scanTarget]);

  const received = async (events: AppEvent[]) => {
    const before = state.events.length;
    const next = await mergeEvents(events);
    update(next);
    setMessage(`${Math.max(0, next.events.length - before)} new events received. Study history merged.`);
  };

  const host = async () => {
    try {
      const next = await createHostSession(state.events, received);
      const nextQrCode = await QRCode.toDataURL(next.pairingCode, { margin: 2, width: 280, errorCorrectionLevel: "L" });
      setSession(next);
      setCode(next.pairingCode);
      setQrCode(nextQrCode);
      setMode("host");
      setMessage("Copy this offer to the other device. Paste its answer below.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not start sync");
    }
  };

  const join = async () => {
    try {
      const next = await createJoinSession(code, state.events, received);
      const nextAnswerQrCode = await QRCode.toDataURL(next.answerCode, { margin: 2, width: 280, errorCorrectionLevel: "L" });
      setSession(next);
      setAnswer(next.answerCode);
      setAnswerQrCode(nextAnswerQrCode);
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
    setQrCode("");
    setAnswerQrCode("");
    setCopied("");
    setScanOpen(false);
  };

  const copy = async (value: string, kind: "offer" | "answer") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(""), 1600);
    } catch {
      setMessage("Copy is unavailable here. Select the code and copy it manually.");
    }
  };

  const openScanner = (target: "offer" | "answer") => {
    setScanTarget(target);
    setScanOpen(true);
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
          <div className="sync-offer">
            <div className="sync-qr-card">
              <p><strong>Scan This Offer</strong></p>
              {qrCode && <Image className="sync-qr" src={qrCode} alt="QR code containing the sync offer" width={280} height={280} unoptimized />}
              <p className="nf-help">Open this page on the other device and scan the code with its camera.</p>
            </div>
            <div className="sync-code-field">
              <label className="nf-field">Offer code<textarea readOnly value={code} /></label>
              <button className="nf-button" type="button" onClick={() => void copy(code, "offer")}>
                {copied === "offer" ? "Copied" : "Copy Offer"}
              </button>
            </div>
          </div>
          <div className="sync-code-field">
            <label className="nf-field">Answer from other device<textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Paste answer here…" /></label>
            <button className="nf-button" type="button" onClick={() => openScanner("answer")}>Scan Answer With Camera</button>
          </div>
          <button className="nf-button-primary" type="submit" disabled={!answer}>Connect devices</button>
        </form>
      )}

      {mode === "join" && (
          <form className="nf-form" onSubmit={(event) => { event.preventDefault(); void join(); }}>
          <div className="sync-code-field">
            <label className="nf-field">Offer from other device<textarea value={code} onChange={(event) => setCode(event.target.value)} placeholder="Paste offer here…" /></label>
            <button className="nf-button" type="button" onClick={() => openScanner("offer")}>Scan Offer With Camera</button>
          </div>
          <button className="nf-button-primary" type="submit" disabled={!code}>Create answer</button>
          {answer && <div className="sync-offer">
            <div className="sync-qr-card">
              <p><strong>Scan This Answer</strong></p>
              <Image className="sync-qr" src={answerQrCode} alt="QR code containing the sync answer" width={280} height={280} unoptimized />
              <p className="nf-help">Scan this from the device that created the session, or use copy/paste.</p>
            </div>
            <div className="sync-code-field">
              <label className="nf-field">Answer code<textarea readOnly value={answer} /></label>
              <button className="nf-button" type="button" onClick={() => void copy(answer, "answer")}>
                {copied === "answer" ? "Copied" : "Copy Answer"}
              </button>
            </div>
          </div>}
        </form>
      )}

      {scanOpen && <dialog className="nf-dialog sync-scanner" open aria-labelledby="sync-scanner-title">
        <div className="sync-scanner-content">
          <div>
            <h3 id="sync-scanner-title">Scan {scanTarget === "offer" ? "Offer" : "Answer"}</h3>
            <p className="nf-help">Point your camera at the QR code on the other device.</p>
          </div>
          <video ref={videoRef} className="sync-camera" muted playsInline />
          <button className="nf-button" type="button" onClick={() => setScanOpen(false)}>Use Paste Instead</button>
        </div>
      </dialog>}

      {message && <p role="status" aria-live="polite">{message}</p>}
    </section>
  );
}
