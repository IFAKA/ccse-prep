"use client";

import { useState } from "react";
import { questions } from "@/data/questions";
import type { AppState } from "@/lib/types";
import { PageHeader, SurfaceCard } from "./PageLayout";

export default function MistakesView({ state }: { state: AppState; update: (state: AppState) => void }) {
  const [filter, setFilter] = useState("all");
  const missed = questions.filter((question) => (state.questionStates[question.id]?.incorrect ?? 0) > 0).filter((question) => filter === "all" || filter === "task1" ? filter === "all" || question.task === 1 : state.questionStates[question.id]?.status === filter);

  return <section className="view-enter py-7 sm:py-10">
    <PageHeader eyebrow="Error ledger" title="Every miss, remembered." description="Review the questions that need another pass, grouped by your current status." />
    <div className="mt-7 flex flex-wrap gap-2">{["all", "weak", "mastered", "task1"].map((option) => <button key={option} onClick={() => setFilter(option)} className={`focus-ring min-h-11 rounded-full border px-4 py-2 text-xs font-semibold uppercase ${filter === option ? "border-[var(--label)] bg-[var(--label)] text-[var(--surface)]" : "border-[var(--separator)] text-[var(--secondary)]"}`}>{option}</button>)}</div>
    <div className="mt-7 grid gap-3">{missed.length ? missed.map((question) => <SurfaceCard key={question.id} className="p-4"><div className="flex justify-between text-xs text-[var(--secondary)]"><span>Task {question.task} · {question.id}</span><span>{state.questionStates[question.id]?.status}</span></div><h2 className="mt-2 text-lg font-semibold">{question.question}</h2><p className="mt-2 text-sm">Official: <b className="uppercase">{question.answer}</b> · {question.options[question.answer]}</p></SurfaceCard>) : <p className="rounded-2xl border border-dashed border-[var(--separator)] p-8 text-center text-[var(--secondary)]">No missed questions yet.</p>}</div>
  </section>;
}
