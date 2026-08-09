"use client";

import type { AppState } from "@/lib/types";
import { exportState, importState, resetState } from "@/lib/storage";
import SyncPanel from "./SyncPanel";
import SoundToggle from "./SoundToggle";
import { PageHeader } from "./PageLayout";

export default function SettingsView({ state, update }: { state: AppState; update: (state: AppState) => void }) {
  const download = async () => {
    const blob = new Blob([await exportState()], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ccse-prep-export.json";
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

  return <section className="nf-stack">
    <PageHeader title="Make it yours." description="Simple preferences for a focused, local-first study desk." />

    <section className="nf-section">
        <h2>Sound</h2>
        <p>Small feedback for answers and study actions. Your choice stays on this device.</p>
        <div className="nf-split">
          <div>
            <p><strong>Sound Effects</strong></p>
            <p>Play gentle tones for correct, incorrect, and completed actions.</p>
          </div>
          <SoundToggle />
        </div>
      </section>

      <section className="nf-section">
        <h2>Local Data</h2>
        <p>Your study history stays in this browser unless you export or sync it.</p>
        <div className="nf-cluster">
          <button className="nf-button-primary" type="button" onClick={download}>Export State</button>
          <label className="nf-field">Import State <input type="file" accept="application/json" onChange={importFile} /></label>
          <button className="nf-button-danger" type="button" onClick={reset}>Reset Local Data</button>
        </div>
      </section>

      <SyncPanel state={state} update={update} />
  </section>;
}
