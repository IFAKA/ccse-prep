"use client";

import { useEffect, useState } from "react";
import { questions, type AnswerKey, type Task } from "@/data/questions";
import { makeEvent, reduceEvent } from "@/lib/events";
import { appendEvent } from "@/lib/storage";
import type { AppState, MockResult } from "@/lib/types";
import { PageHeader } from "./PageLayout";

const composition: Record<Task, number> = { 1: 10, 2: 3, 3: 2, 4: 3, 5: 7 };

function makeMock() {
  return [1, 2, 3, 4, 5].flatMap((task) =>
    questions.filter((question) => question.task === task).sort(() => Math.random() - 0.5).slice(0, composition[task as Task]),
  );
}

export default function MockView({ state, update }: { state: AppState; update: (state: AppState) => void }) {
  const [active, setActive] = useState(false);
  const [started, setStarted] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerKey>>({});
  const [result, setResult] = useState<MockResult>();
  const [mock, setMock] = useState(makeMock);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [active]);

  const start = () => {
    setMock(makeMock()); setActive(true); setStarted(Date.now()); setNow(Date.now());
    setIndex(0); setAnswers({}); setResult(undefined);
  };

  const finish = () => {
    const breakdown = {} as Record<Task, { correct: number; total: number }>;
    const mistakes: number[] = [];
    for (const task of [1, 2, 3, 4, 5] as Task[]) {
      const taskQuestions = mock.filter((question) => question.task === task);
      breakdown[task] = { total: taskQuestions.length, correct: taskQuestions.filter((question) => answers[question.id] === question.answer).length };
      taskQuestions.filter((question) => answers[question.id] !== question.answer).forEach((question) => mistakes.push(question.id));
    }
    const nextResult: MockResult = { id: crypto.randomUUID(), timestamp: Date.now(), score: Object.values(breakdown).reduce((total, item) => total + item.correct, 0), taskBreakdown: breakdown, mistakes, durationMs: Date.now() - started };
    const event = makeEvent("MOCK_COMPLETED", { result: nextResult });
    appendEvent(event); update(reduceEvent(state, event)); setResult(nextResult); setActive(false);
  };

  if (result) {
    return <section className="nf-stack">
      <PageHeader title={`${result.score}/25`} description={`${result.score >= 15 ? "Aprobado" : "Sigue entrenando"} · threshold 15/25`} />
      <dl className="nf-grid">
        {Object.entries(result.taskBreakdown).map(([task, value]) => <div key={task}><dt>Task {task}</dt><dd><strong>{value.correct}/{value.total}</strong></dd></div>)}
      </dl>
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
  const remaining = Math.max(0, 45 * 60 - Math.floor((now - started) / 1000));
  const optionKeys = Object.keys(question.options) as AnswerKey[];

  return <section className="nf-stack">
    <header><h2>Mock · {index + 1}/25</h2><p><strong aria-label="Time remaining">{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}</strong></p></header>
    <section className="nf-section">
      <p>Task {question.task}</p>
      <fieldset className="nf-field">
        <legend>{question.question}</legend>
        <div className="nf-form">
          {optionKeys.map((answer) => <label key={answer}>
            <input
              type="radio"
              name={`mock-question-${question.id}`}
              value={answer}
              checked={answers[question.id] === answer}
              onChange={() => setAnswers({ ...answers, [question.id]: answer })}
            />
            <span>{question.options[answer]}</span>
          </label>)}
        </div>
      </fieldset>
    </section>
    <footer className="nf-cluster"><button className="nf-button" type="button" disabled={!index} onClick={() => setIndex(index - 1)}>Back</button>{index === 24 ? <button className="nf-button-primary" type="button" onClick={finish}>Hand In</button> : <button className="nf-button-primary" type="button" onClick={() => setIndex(index + 1)}>Next</button>}</footer>
  </section>;
}
