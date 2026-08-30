"use client";

import { useState } from "react";
import type { AppState, Settings } from "@/lib/types";
import { exportState, importState, resetState, appendEvent } from "@/lib/storage";
import { makeEvent, reduceEvent } from "@/lib/events";
import { scheduleDailyReminder, scheduleTestReminder } from "@/lib/reminders";
import SyncPanel from "./SyncPanel";
import SoundToggle from "./SoundToggle";
import { PageHeader } from "./PageLayout";

export default function SettingsView({ state, update }: { state: AppState; update: (state: AppState) => void }) {
  const [dataMessage, setDataMessage] = useState("");
  const changeSettings = async (patch: Partial<Settings>) => {
    const event = makeEvent("SETTINGS_UPDATED", patch);
    const next = reduceEvent(state, event);
    update(next);
    await appendEvent(event);
    const result = await scheduleDailyReminder(next.settings);
    if (result.reason === "permission-denied") setReminderMessage("Notifications are blocked. Enable them in Android settings for CCSE Prep.");
    else if (result.reason === "native-only") setReminderMessage("Reminders are available in the Android app.");
    else setReminderMessage(next.settings.remindersEnabled ? "Daily reminder saved." : "Daily reminder turned off.");
  };
  const testReminder = async () => {
    setReminderMessage("Sending a test reminder…");
    const result = await scheduleTestReminder();
    if (result.reason === "permission-denied") setReminderMessage("Notifications are blocked. Enable them in Android settings for CCSE Prep.");
    else if (result.reason === "native-only") setReminderMessage("Test reminders are available in the Android app.");
    else setReminderMessage("Test reminder scheduled. It should appear in about two seconds.");
  };
  const [reminderMessage, setReminderMessage] = useState("");
  const download = async () => {
    try {
      const json = await exportState();
      const filename = `ccse-prep-export-${new Date().toISOString().slice(0, 10)}.json`;
      const { Capacitor } = await import("@capacitor/core");
      if (Capacitor.isNativePlatform()) {
        const { Filesystem, Directory, Encoding } = await import("@capacitor/filesystem");
        const { Share } = await import("@capacitor/share");
        const file = await Filesystem.writeFile({ path: filename, data: json, directory: Directory.Cache, encoding: Encoding.UTF8 });
        await Share.share({ title: "CCSE Prep Export", text: "Your CCSE Prep study data export.", url: file.uri, dialogTitle: "Save CCSE Prep Export" });
        setDataMessage("Export ready. Choose Files or another app to save it.");
        return;
      }
      const blob = new Blob([json], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
      setDataMessage("Export downloaded.");
    } catch (error) {
      setDataMessage(error instanceof Error ? error.message : "Could not export local data.");
    }
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
        {dataMessage && <p role="status" aria-live="polite">{dataMessage}</p>}
      </section>

      <section className="nf-section">
        <h2>Study Reminders</h2>
        <p>Get one local notification each day. Your study data remains on this device.</p>
        <label className="nf-field">
          <span>Daily Reminder</span>
          <input type="checkbox" checked={state.settings.remindersEnabled} onChange={(event) => void changeSettings({ remindersEnabled: event.target.checked })} />
        </label>
        <label className="nf-field">
          <span>Reminder Time</span>
          <input type="time" value={`${String(state.settings.reminderHour).padStart(2, "0")}:${String(state.settings.reminderMinute).padStart(2, "0")}`} onChange={(event) => { const [hour, minute] = event.target.value.split(":").map(Number); void changeSettings({ reminderHour: hour, reminderMinute: minute }); }} disabled={!state.settings.remindersEnabled} />
        </label>
        <button className="nf-button" type="button" onClick={() => void testReminder()}>Test Reminder Now</button>
        {reminderMessage && <p role="status" aria-live="polite">{reminderMessage}</p>}
      </section>

      <SyncPanel state={state} update={update} />
  </section>;
}
