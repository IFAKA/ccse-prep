"use client";

import type { AppState } from "@/lib/types";
import { exportState, importState, resetState } from "@/lib/storage";
import SyncPanel from "./SyncPanel";
import SoundToggle from "./SoundToggle";
import { PageHeader, SectionHeading, SurfaceCard } from "./PageLayout";

export default function SettingsView({ state, update }: { state: AppState; update: (state: AppState) => void }) {
  const download = async () => {
    const blob = new Blob([await exportState()], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ccse-desk-export.json";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const importFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      update(await importState(await file.text()));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Invalid export");
    }
    event.target.value = "";
  };

  const reset = async () => {
    if (!confirm("Reset all local study state? This cannot be undone.")) return;
    await resetState();
    location.reload();
  };

  return <section className="view-enter py-7 sm:py-10">
    <PageHeader eyebrow="Settings" title="Make it yours." description="Simple preferences for a focused, local-first study desk." />

    <div className="mt-8 grid gap-8">
      <SurfaceCard className="p-5 sm:p-6">
        <SectionHeading description="Small feedback for answers and study actions. Your choice stays on this device.">Sound</SectionHeading>
        <div className="mt-5 flex min-h-14 items-center justify-between gap-4 border-t border-[var(--separator)] pt-4">
          <div>
            <p className="font-medium">Sound Effects</p>
            <p className="mt-1 text-[13px] text-[var(--secondary)]">Play gentle tones for correct, incorrect, and completed actions.</p>
          </div>
          <SoundToggle />
        </div>
      </SurfaceCard>

      <SurfaceCard className="p-5 sm:p-6">
        <SectionHeading description="Your study history stays in this browser unless you export or sync it.">Local Data</SectionHeading>
        <div className="mt-5 grid gap-3 border-t border-[var(--separator)] pt-4 sm:flex sm:flex-wrap">
          <button type="button" onClick={download} className="focus-ring min-h-11 rounded-xl border border-[var(--separator)] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Export State</button>
          <label className="focus-ring min-h-11 cursor-pointer rounded-xl border border-[var(--separator)] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Import State<input type="file" accept="application/json" onChange={importFile} className="hidden" /></label>
          <button type="button" onClick={reset} className="focus-ring min-h-11 rounded-xl border border-[var(--danger)] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--danger)]">Reset Local Data</button>
        </div>
      </SurfaceCard>

      <SyncPanel state={state} update={update} />
    </div>
  </section>;
}
