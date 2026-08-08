"use client";

import { useEffect, useRef, useState } from "react";
import SoundToggle from "./SoundToggle";

export default function SettingsPanel({ navItem = false }: { navItem?: boolean }) {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return <>
    <button
      type="button"
      className={navItem ? "focus-ring nav-mobile-tab flex min-h-16 min-w-16 flex-col items-center justify-center gap-1 rounded-lg px-2 text-[11px] text-[var(--secondary)] sm:min-w-20 sm:px-3 sm:text-[13px]" : "focus-ring rounded-lg px-2 py-2 text-[13px] text-[var(--secondary)]"}
      aria-label="Open settings"
      aria-expanded={open}
      aria-controls="settings-panel"
      onClick={() => setOpen(true)}
    >
      <span aria-hidden="true" className="text-lg leading-none">⚙</span>
      <span>{navItem ? "Settings" : <span className="sr-only">Settings</span>}</span>
    </button>

    {open && <div className="settings-backdrop fixed inset-0 z-40 flex items-end justify-center bg-black/30 p-4 sm:items-center" onMouseDown={(event) => {
      if (event.target === event.currentTarget) setOpen(false);
    }}>
      <section
        id="settings-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="settings-panel w-full max-w-md rounded-2xl border border-[var(--separator)] bg-[var(--surface)] p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-[12px] font-medium uppercase tracking-[.12em] text-[var(--secondary)]">Preferences</p>
            <h2 id="settings-title" className="text-xl font-semibold tracking-tight">Settings</h2>
          </div>
          <button ref={closeButtonRef} type="button" className="focus-ring rounded-lg px-2 py-1 text-xl leading-none text-[var(--secondary)]" aria-label="Close settings" onClick={() => setOpen(false)}>×</button>
        </div>
        <div className="mt-5 flex min-h-14 items-center justify-between gap-4 border-t border-[var(--separator)] pt-4">
          <div>
            <p className="font-medium">Sound Effects</p>
            <p className="mt-1 text-[13px] text-[var(--secondary)]">Feedback for answers and study actions.</p>
          </div>
          <SoundToggle />
        </div>
      </section>
    </div>}
  </>;
}
