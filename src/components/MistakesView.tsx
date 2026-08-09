"use client";

import { useState } from "react";
import { questions } from "@/data/questions";
import type { AppState } from "@/lib/types";
import { PageHeader } from "./PageLayout";

export default function MistakesView({ state }: { state: AppState; update: (state: AppState) => void }) {
  const [filter, setFilter] = useState("all");
  const missed = questions.filter((question) => (state.questionStates[question.id]?.incorrect ?? 0) > 0).filter((question) => filter === "all" || filter === "task1" ? filter === "all" || question.task === 1 : state.questionStates[question.id]?.status === filter);

  return <section className="view-enter">
    <PageHeader title="Every miss, remembered." description="Review the questions that need another pass, grouped by your current status." />
    <fieldset className="filter-group">
      <legend>Show</legend>
      {["all", "weak", "mastered", "task1"].map((option) => (
        <label key={option}>
          <input
            type="radio"
            name="mistake-filter"
            value={option}
            checked={filter === option}
            onChange={() => setFilter(option)}
          />
          {option === "task1" ? "Task 1" : option[0].toUpperCase() + option.slice(1)}
        </label>
      ))}
    </fieldset>
    <ul>
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
