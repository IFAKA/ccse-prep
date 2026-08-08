"use client";

import { useEffect, useState } from "react";
import { questions, type AnswerKey, type Task } from "@/data/questions";
import { makeEvent, reduceEvent } from "@/lib/events";
import { appendEvent } from "@/lib/storage";
import type { AppState, MockResult } from "@/lib/types";
import { PageHeader, SectionHeading, StatCard, SurfaceCard } from "./PageLayout";

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
    return <section className="view-enter">
      <PageHeader eyebrow="Mock complete" title={`${result.score}/25`} description={`${result.score >= 15 ? "Aprobado" : "Sigue entrenando"} · threshold 15/25`} />
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Object.entries(result.taskBreakdown).map(([task, value]) => <StatCard key={task} label={`Task ${task}`} value={`${value.correct}/${value.total}`} />)}
      </div>
      <button onClick={start} className="focus-ring mt-8 min-h-12 rounded-xl bg-[var(--label)] px-6 font-semibold text-[var(--surface)]">New Mock</button>
    </section>;
  }

  if (!active) {
    return <section className="view-enter">
      <PageHeader eyebrow="Exam simulation" title="25 questions. 45 quiet minutes." description="Exact CCSE composition: 10 / 3 / 2 / 3 / 7. No feedback until you hand in the paper." />
      <button onClick={start} className="focus-ring mt-8 min-h-12 rounded-xl bg-[var(--label)] px-7 font-semibold text-[var(--surface)]">Start Mock</button>
    </section>;
  }

  const question = mock[index];
  const remaining = Math.max(0, 45 * 60 - Math.floor((now - started) / 1000));
  const optionKeys = Object.keys(question.options) as AnswerKey[];

  return <section className="view-enter">
    <div className="flex items-center justify-between"><SectionHeading>Mock · {index + 1}/25</SectionHeading><p className="text-sm font-semibold tabular-nums" aria-label="Time remaining">{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}</p></div>
    <SurfaceCard className="mt-7 p-5 sm:p-7">
      <p className="text-[13px] text-[var(--secondary)]">Task {question.task}</p>
      <h2 className="mt-3 text-2xl font-semibold leading-tight sm:text-4xl">{question.question}</h2>
      <div className="mt-8 grid gap-3" role="group" aria-label="Answer choices">
        {optionKeys.map((answer) => <button key={answer} onClick={() => setAnswers({ ...answers, [question.id]: answer })} aria-pressed={answers[question.id] === answer} className={`focus-ring flex min-h-14 gap-4 rounded-xl border p-4 text-left ${answers[question.id] === answer ? "border-[var(--tint)] bg-[color:var(--tint)/.1]" : "border-[var(--separator)]"}`}><b className="uppercase">{answer}</b>{question.options[answer]}</button>)}
      </div>
    </SurfaceCard>
    <div className="mt-5 flex gap-3"><button disabled={!index} onClick={() => setIndex(index - 1)} className="focus-ring min-h-12 rounded-xl border border-[var(--separator)] px-5 font-semibold">Back</button>{index === 24 ? <button onClick={finish} className="focus-ring min-h-12 flex-1 rounded-xl bg-[var(--label)] px-5 font-semibold text-[var(--surface)]">Hand In</button> : <button onClick={() => setIndex(index + 1)} className="focus-ring min-h-12 flex-1 rounded-xl bg-[var(--label)] px-5 font-semibold text-[var(--surface)]">Next</button>}</div>
  </section>;
}
