"use client";

import Link from "next/link";
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

type Tab = "study" | "mock" | "errors" | "progress" | "settings";
type TabConfig = { id: Tab; label: string; icon: string; href: string };

const tabs: TabConfig[] = [
  { id: "study", label: "Study", icon: "◉", href: "/study" },
  { id: "mock", label: "Mock", icon: "▣", href: "/mock" },
  { id: "errors", label: "Errors", icon: "!", href: "/errors" },
  { id: "progress", label: "Progress", icon: "↗", href: "/progress" },
  { id: "settings", label: "Settings", icon: "⚙", href: "/settings" },
];

export default function AppShell() {
  const pathname = usePathname();
  const activeTab = tabs.find((tab) => tab.href === pathname)?.id ?? "study";
  const [state, setState] = useState<AppState>(blankState());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadState().then((nextState) => {
      setState(nextState);
      setReady(true);
    });
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  const update = (nextState: AppState) => setState(nextState);

  return <>
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-24 sm:px-6 sm:pb-28">
      {!ready ? <div className="py-20 text-center text-[var(--secondary)]" role="status" aria-live="polite">Loading…</div> : <div key={activeTab} className="pt-4 sm:pt-8">
        {activeTab === "study" ? <StudyView state={state} update={update} /> : activeTab === "mock" ? <MockView state={state} update={update} /> : activeTab === "errors" ? <MistakesView state={state} update={update} /> : activeTab === "progress" ? <ProgressView state={state} update={update} /> : <SettingsView state={state} update={update} />}
      </div>}
      <footer className="hidden border-t border-[var(--separator)] pt-4 text-[12px] text-[var(--secondary)] sm:flex sm:justify-between">
        <span>Official CCSE 2026 question bank</span>
        <span>Local-only study data</span>
      </footer>
    </main>

    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--separator)] bg-[color:var(--surface)/.94] pb-[env(safe-area-inset-bottom)] backdrop-blur-xl" aria-label="Main navigation">
      <div className="mx-auto flex max-w-3xl justify-around px-2 sm:justify-center sm:gap-8">
        {tabs.map(({ id, label, icon, href }) => <Link key={id} href={href} aria-current={activeTab === id ? "page" : undefined} className={`focus-ring nav-mobile-tab flex min-h-16 min-w-16 flex-col items-center justify-center gap-1 rounded-lg text-[11px] sm:min-w-20 sm:px-3 sm:text-[13px] ${activeTab === id ? "is-active text-[var(--tint)]" : "text-[var(--secondary)]"}`}>
          <span aria-hidden="true" className="text-lg leading-none">{icon}</span>
          <span>{label}</span>
        </Link>)}
      </div>
    </nav>
    <SplashScreen />
  </>;
}
