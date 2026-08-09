"use client";

import { useState } from "react";
import { questions } from "@/data/questions";
import type { AppState } from "@/lib/types";
import { PageHeader } from "./PageLayout";

export default function MistakesView({ state }: { state: AppState; update: (state: AppState) => void }) {
  const [filter, setFilter] = useState("all");
  const missed = questions.filter((question) => (state.questionStates[question.id]?.incorrect ?? 0) > 0).filter((question) => filter === "all" || filter === "task1" ? filter === "all" || question.task === 1 : state.questionStates[question.id]?.status === filter);

  return <section className="nf-stack">
    <PageHeader title="Every miss, remembered." description="Review the questions that need another pass, grouped by your current status." />
    <label className="nf-field">
      <span>Show</span>
      <select value={filter} onChange={(event) => setFilter(event.target.value)}>
        <option value="all">All</option>
        <option value="weak">Weak</option>
        <option value="mastered">Mastered</option>
        <option value="task1">Task 1</option>
      </select>
    </label>
    <ul className="nf-stack">
      {missed.length ? missed.map((question) => (
        <li key={question.id}>
          <article>
            <header><span>Task {question.task} · {question.id}</span><span>{state.questionStates[question.id]?.status}</span></header>
            <h2>{question.question}</h2>
            <p>Official: <b>{question.answer}</b> · {question.options[question.answer]}</p>
          </article>
        </li>
      )) : <li>No missed questions yet.</li>}
    </ul>
  </section>;
}
