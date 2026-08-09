"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { blankState } from "@/lib/events";
import { loadState } from "@/lib/storage";
import type { AppState } from "@/lib/types";
import MistakesView from "./MistakesView";
import MockView from "./MockView";
import ProgressView from "./ProgressView";
import SettingsView from "./SettingsView";
import SplashScreen from "./SplashScreen";
import StudyView from "./StudyView";
import Navigation from "./Navigation";

export default function AppShell() {
  const pathname = usePathname();
  const activeTab = pathname === "/study" ? "study" : pathname === "/mock" ? "mock" : pathname === "/errors" ? "errors" : pathname === "/progress" ? "progress" : "settings";
  const [state, setState] = useState<AppState>(blankState());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadState().then((nextState) => {
      setState(nextState);
    }).catch(() => {
      setState(blankState());
    }).finally(() => setReady(true));
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js?v=3").catch(() => {});
  }, []);

  const update = (nextState: AppState) => setState(nextState);

  return <>
    <header className="nf-container nf-page-header">
      <strong>CCSE Prep</strong>
      <Navigation />
    </header>

    <main id="main-content" className="nf-page nf-container">
      {!ready ? <div className="nf-loading" role="status" aria-live="polite">Loading…</div> : <div key={pathname}>
        {activeTab === "study" ? <StudyView state={state} update={update} /> : activeTab === "mock" ? <MockView state={state} update={update} /> : activeTab === "errors" ? <MistakesView state={state} update={update} /> : activeTab === "progress" ? <ProgressView state={state} update={update} /> : <SettingsView state={state} update={update} />}
      </div>}
    </main>
    <SplashScreen />
  </>;
}
