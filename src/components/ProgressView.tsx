"use client";

import { questions } from "@/data/questions";
import { readiness } from "@/lib/readiness";
import type { AppState } from "@/lib/types";
import { exportState, importState, resetState } from "@/lib/storage";
import SyncPanel from "./SyncPanel";
import { PageHeader, SectionHeading, StatCard, SurfaceCard } from "./PageLayout";

export default function ProgressView({ state, update }: { state: AppState; update: (state: AppState) => void }) {
  const seen = questions.filter((question) => state.questionStates[question.id]?.attempts).length;
  const mastered = questions.filter((question) => state.questionStates[question.id]?.status === "mastered").length;
  const weak = questions.filter((question) => state.questionStates[question.id]?.status === "weak").length;
  const progress = readiness(state, questions);
  const average = state.mockHistory.length ? Math.round(state.mockHistory.reduce((total, mock) => total + mock.score, 0) / state.mockHistory.length * 10) / 10 : 0;
  const download = async () => { const blob = new Blob([await exportState()], { type: "application/json" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "ccse-desk-export.json"; link.click(); URL.revokeObjectURL(link.href); };
  const importFile = async (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; try { update(await importState(await file.text())); } catch (error) { alert(error instanceof Error ? error.message : "Invalid export"); } };

  return <section className="view-enter py-7 sm:py-10">
    <PageHeader eyebrow="Progress" title="Know your runway." aside={<span className={`rounded-full px-4 py-2 text-xs font-semibold uppercase ${progress.ready ? "bg-[var(--success)] text-white" : "bg-[var(--label)] text-[var(--surface)]"}`}>{progress.ready ? "Ready" : "Not ready yet"}</span>} />
    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4"><StatCard label="Seen" value={`${seen}/300`} /><StatCard label="Mastered" value={mastered} /><StatCard label="Weak" value={weak} /><StatCard label="Mock avg" value={average || "—"} /></div>
    <SurfaceCard className="mt-8 p-5 sm:p-6"><SectionHeading>Readiness criteria</SectionHeading><div className="mt-4 grid gap-3">{progress.conditions.map((condition) => <div key={condition.label} className="flex items-center gap-3 border-t border-[var(--separator)] pt-3"><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${condition.met ? "bg-[var(--success)] text-white" : "bg-[var(--surface-2)] text-[var(--secondary)]"}`}>{condition.met ? "✓" : "·"}</span><div><p className="font-semibold">{condition.label}</p><p className="text-xs text-[var(--secondary)]">{condition.detail}</p></div></div>)}</div></SurfaceCard>
    <div className="mt-8"><SectionHeading>Mock history</SectionHeading>{state.mockHistory.length ? <div className="mt-3 grid gap-2">{state.mockHistory.slice(0, 8).map((mock) => <div key={mock.id} className="flex justify-between border-b border-[var(--separator)] py-3 text-sm"><span>{new Date(mock.timestamp).toLocaleDateString("es-ES")}</span><b className="tabular-nums">{mock.score}/25</b></div>)}</div> : <p className="mt-3 text-[var(--secondary)]">Your mock history will appear here.</p>}</div>
    <SyncPanel state={state} update={update} />
    <div className="mt-8 flex flex-wrap gap-3"><button onClick={download} className="focus-ring min-h-11 rounded-xl border border-[var(--separator)] px-4 py-3 text-xs font-semibold uppercase tracking-wider">Export state</button><label className="focus-ring min-h-11 cursor-pointer rounded-xl border border-[var(--separator)] px-4 py-3 text-xs font-semibold uppercase tracking-wider">Import state<input type="file" accept="application/json" onChange={importFile} className="hidden" /></label><button onClick={async () => { if (confirm("Reset all local study state? This cannot be undone.")) { await resetState(); location.reload(); } }} className="focus-ring min-h-11 rounded-xl border border-[var(--danger)] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--danger)]">Reset</button></div>
  </section>;
}
