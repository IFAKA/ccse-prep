"use client";

import { questions } from "@/data/questions";
import { readiness } from "@/lib/readiness";
import type { AppState } from "@/lib/types";
import { PageHeader } from "./PageLayout";

export default function ProgressView({ state, update }: { state: AppState; update: (state: AppState) => void }) {
  const seen = questions.filter((question) => state.questionStates[question.id]?.attempts).length;
  const mastered = questions.filter((question) => state.questionStates[question.id]?.status === "mastered").length;
  const weak = questions.filter((question) => state.questionStates[question.id]?.status === "weak").length;
  const progress = readiness(state, questions);
  const average = state.mockHistory.length ? Math.round(state.mockHistory.reduce((total, mock) => total + mock.score, 0) / state.mockHistory.length * 10) / 10 : 0;

  return <section className="view-enter progress-view">
    <PageHeader title="Know your runway." aside={<span>{progress.ready ? "Ready" : "Not ready yet"}</span>} />
    <dl>
      <div><dt>Seen</dt><dd><strong>{seen}/300</strong></dd></div>
      <div><dt>Mastered</dt><dd><strong>{mastered}</strong></dd></div>
      <div><dt>Weak</dt><dd><strong>{weak}</strong></dd></div>
      <div><dt>Mock avg</dt><dd><strong>{average || "—"}</strong></dd></div>
    </dl>
    <section>
      <h2>Readiness criteria</h2>
      <ul>
        {progress.conditions.map((condition) => <li key={condition.label}><div><p><strong>{condition.label}</strong></p><p>{condition.detail}</p></div></li>)}
      </ul>
    </section>
    <section>
      <h2>Mock history</h2>
      {state.mockHistory.length ? <ul>{state.mockHistory.slice(0, 8).map((mock) => <li key={mock.id}><span>{new Date(mock.timestamp).toLocaleDateString("es-ES")}</span><b>{mock.score}/25</b></li>)}</ul> : <p>Your mock history will appear here.</p>}
    </section>
  </section>;
}
