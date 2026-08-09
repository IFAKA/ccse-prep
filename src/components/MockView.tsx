"use client";

import { useCallback, useEffect, useState } from "react";
import { questions, type AnswerKey } from "@/data/questions";
import { makeEvent, reduceEvent } from "@/lib/events";
import { appendEvent } from "@/lib/storage";
import type { AppState, MockResult } from "@/lib/types";
import { makeMock, MOCK_DURATION_MS, remainingMs, scoreMock } from "@/lib/mock";
import { PageHeader } from "./PageLayout";

export default function MockView({ state, update }: { state: AppState; update: (state: AppState) => void }) {
  const [active, setActive] = useState(false);
  const [started, setStarted] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerKey>>({});
  const [result, setResult] = useState<MockResult>();
  const [mock, setMock] = useState(makeMock);

  const finish = useCallback(async (finishedAt = Date.now()) => {
    if (!active) return;
    const nextResult = scoreMock(mock, answers, finishedAt, started);
    const event = makeEvent("MOCK_COMPLETED", { result: nextResult });
    await appendEvent(event);
    update(reduceEvent(state, event));
    setResult(nextResult);
    setActive(false);
  }, [active, answers, mock, started, state, update]);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [active]);

  useEffect(() => {
    if (active && started > 0 && remainingMs(started, now) === 0) void finish(started + MOCK_DURATION_MS);
  }, [active, finish, now, started]);

  const start = () => {
    setMock(makeMock()); setActive(true); setStarted(Date.now()); setNow(Date.now());
    setIndex(0); setAnswers({}); setResult(undefined);
  };

  const isEditableTarget = (target: EventTarget | null) => Boolean((target as HTMLElement | null)?.closest("input, textarea, select, [contenteditable='true']"));
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      const key = event.key.toLowerCase();
      if (key === "s") { window.location.assign("/study"); return; }
      if (key === "m") { window.location.assign("/mock"); return; }
      if (key === "e") { window.location.assign("/errors"); return; }
      if (key === "g") { window.sessionStorage.setItem("ccse-g-prefix", "1"); return; }
      if (key === "p" && window.sessionStorage.getItem("ccse-g-prefix")) { window.sessionStorage.removeItem("ccse-g-prefix"); window.location.assign("/progress"); return; }
      if (!active) return;
      if (["1", "2", "3", "a", "b", "c"].includes(key)) {
        const answer: AnswerKey = key === "1" || key === "a" ? "a" : key === "2" || key === "b" ? "b" : "c";
        setAnswers((current) => ({ ...current, [mock[index].id]: answer }));
        return;
      }
      if (key === "j" || key === "arrowright" || key === "arrowdown") { event.preventDefault(); setIndex((current) => Math.min(24, current + 1)); return; }
      if (key === "k" || key === "arrowleft" || key === "arrowup") { event.preventDefault(); setIndex((current) => Math.max(0, current - 1)); return; }
      if (key === "enter" || key === " ") { event.preventDefault(); if (index === 24) void finish(); else setIndex((current) => Math.min(24, current + 1)); }
      if (key === "escape") setActive(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, finish, index, mock]);

  if (result) {
    return <section className="nf-stack">
      <PageHeader title={`${result.score}/25`} description={`${result.score >= 15 ? "Aprobado" : "Sigue entrenando"} · threshold 15/25`} />
      <dl className="nf-grid">
        {Object.entries(result.taskBreakdown).map(([task, value]) => <div key={task}><dt>Task {task}</dt><dd><strong>{value.correct}/{value.total}</strong></dd></div>)}
      </dl>
      <section className="nf-section" aria-labelledby="mock-mistakes"><h2 id="mock-mistakes">Mistakes</h2>{result.mistakes.length ? <ul>{result.mistakes.map((id) => <li key={id}>Question {id}</li>)}</ul> : <p>No mistakes.</p>}</section>
      <button className="nf-button-primary" type="button" onClick={start}>New Mock</button>
    </section>;
  }

  if (!active) {
    return <section className="nf-stack">
      <PageHeader title="25 questions. 45 quiet minutes." description="Exact CCSE composition: 10 / 3 / 2 / 3 / 7. No feedback until you hand in the paper." />
      <button className="nf-button-primary" type="button" onClick={start}>Start Mock</button>
    </section>;
  }

  const question = mock[index];
  const remaining = remainingMs(started, now);
  const optionKeys = Object.keys(question.options) as AnswerKey[];
  return <section className="nf-stack">
    <header><h2>Mock · {index + 1}/25</h2><p><strong aria-label="Time remaining">{Math.floor(remaining / 60000)}:{String(Math.floor(remaining / 1000) % 60).padStart(2, "0")}</strong></p></header>
    <section className="nf-section"><p>Task {question.task}</p><fieldset className="nf-field"><legend>{question.question}</legend><div className="nf-form">{optionKeys.map((answer) => <label key={answer}><input type="radio" name={`mock-question-${question.id}`} value={answer} checked={answers[question.id] === answer} onChange={() => setAnswers({ ...answers, [question.id]: answer })} /><span>{question.options[answer]}</span></label>)}</div></fieldset></section>
    <footer className="study-actions nf-cluster"><button className="nf-button" type="button" disabled={!index} onClick={() => setIndex(index - 1)}>Back</button>{index === 24 ? <button className="nf-button-primary" type="button" onClick={() => void finish()}>Hand In</button> : <button className="nf-button-primary" type="button" onClick={() => setIndex(index + 1)}>Next</button>}</footer>
  </section>;
}
