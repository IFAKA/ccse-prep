"use client";

import { questions } from "@/data/questions";
import { readiness } from "@/lib/readiness";
import type { AppState } from "@/lib/types";
import { PageHeader, SectionHeading, StatCard, SurfaceCard } from "./PageLayout";

export default function ProgressView({ state, update }: { state: AppState; update: (state: AppState) => void }) {
  const seen = questions.filter((question) => state.questionStates[question.id]?.attempts).length;
  const mastered = questions.filter((question) => state.questionStates[question.id]?.status === "mastered").length;
  const weak = questions.filter((question) => state.questionStates[question.id]?.status === "weak").length;
  const progress = readiness(state, questions);
  const average = state.mockHistory.length ? Math.round(state.mockHistory.reduce((total, mock) => total + mock.score, 0) / state.mockHistory.length * 10) / 10 : 0;

  return <section className="view-enter">
    <PageHeader title="Know your runway." aside={<span className={`rounded-full px-4 py-2 text-xs font-semibold uppercase ${progress.ready ? "bg-[var(--success)] text-white" : "bg-[var(--label)] text-[var(--surface)]"}`}>{progress.ready ? "Ready" : "Not ready yet"}</span>} />
    <div className="page-section grid grid-cols-2 gap-3 sm:grid-cols-4"><StatCard label="Seen" value={`${seen}/300`} /><StatCard label="Mastered" value={mastered} /><StatCard label="Weak" value={weak} /><StatCard label="Mock avg" value={average || "—"} /></div>
    <SurfaceCard className="page-section p-4 sm:p-6"><SectionHeading>Readiness criteria</SectionHeading><div className="mt-5 grid gap-4">{progress.conditions.map((condition) => <div key={condition.label} className="flex items-center gap-3 border-t border-[var(--separator)] pt-4"><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${condition.met ? "bg-[var(--success)] text-white" : "bg-[var(--surface-2)] text-[var(--secondary)]"}`}>{condition.met ? "✓" : "·"}</span><div><p className="font-semibold">{condition.label}</p><p className="text-xs text-[var(--secondary)]">{condition.detail}</p></div></div>)}</div></SurfaceCard>
    <div className="page-section"><SectionHeading>Mock history</SectionHeading>{state.mockHistory.length ? <div className="mt-4 grid gap-2">{state.mockHistory.slice(0, 8).map((mock) => <div key={mock.id} className="flex justify-between border-b border-[var(--separator)] py-3 text-sm"><span>{new Date(mock.timestamp).toLocaleDateString("es-ES")}</span><b className="tabular-nums">{mock.score}/25</b></div>)}</div> : <p className="mt-4 text-[var(--secondary)]">Your mock history will appear here.</p>}</div>
  </section>;
}
