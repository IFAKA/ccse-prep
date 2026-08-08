"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { questions, type AnswerKey, type Question } from "@/data/questions";
import { chunksForQuestion } from "@/data/manualKnowledge";
import { makeEvent, reduceEvent } from "@/lib/events";
import { appendEvent } from "@/lib/storage";
import { grade, selectNext } from "@/lib/scheduler";
import type { AppState } from "@/lib/types";
import { MockExplanationProvider } from "@/lib/ai";

export default function StudyView({
  state,
  update,
}: {
  state: AppState;
  update: (state: AppState) => void;
}) {
  const [question, setQuestion] = useState<Question>(() =>
    selectNext(questions, state.questionStates),
  );
  const [selected, setSelected] = useState<AnswerKey>();
  const [submitted, setSubmitted] = useState(false);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [why, setWhy] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const provider = useMemo(() => new MockExplanationProvider(), []);

  const submit = useCallback(() => {
    if (!selected || submitted) return;

    const event = makeEvent("ANSWER_RECORDED", {
      questionId: question.id,
      correct: grade(question, selected),
      responseMs: Date.now() - startedAt,
    });

    appendEvent(event);
    update(reduceEvent(state, event));
    setSubmitted(true);
  }, [question, selected, startedAt, state, submitted, update]);

  const next = useCallback(() => {
    setQuestion(
      selectNext(questions, state.questionStates, Date.now(), new Set([question.id])),
    );
    setSelected(undefined);
    setSubmitted(false);
    setWhy(false);
    setExplanation("");
    setStartedAt(Date.now());
  }, [question.id, state.questionStates]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement)?.tagName === "INPUT") return;

      if (["1", "2", "3", "a", "b", "c"].includes(event.key) && !submitted) {
        const key: AnswerKey =
          event.key === "1" || event.key === "a"
            ? "a"
            : event.key === "2" || event.key === "b"
              ? "b"
              : "c";
        if (question.options[key]) setSelected(key);
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        submitted ? next() : submit();
      }

      if (event.key === "?") setShowShortcuts(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, question.options, submit, submitted]);

  const correct = submitted && selected ? grade(question, selected) : false;
  const optionKeys = Object.keys(question.options) as AnswerKey[];

  const explain = () => {
    setWhy(true);
    provider
      .explain({
        question,
        officialAnswer: question.answer,
        selectedAnswer: selected,
        manualChunks: chunksForQuestion(question.task).map((chunk) => chunk.text),
      })
      .then((result) => setExplanation(result.text));
  };

  return (
    <section className="py-5 sm:py-8">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[15px] font-semibold text-[var(--tint)]">Study</p>
          <p className="mt-1 text-[13px] text-[var(--secondary)]">
            Task {question.task} · Question {question.id}
          </p>
        </div>
        <span className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-[12px] font-medium text-[var(--secondary)]">
          {state.questionStates[question.id]?.status ?? "unseen"}
        </span>
      </div>

      <div className="rounded-2xl border border-[var(--separator)] bg-[var(--surface)] p-4 sm:p-6">
        <h2 className="max-w-2xl text-[25px] font-semibold leading-[1.2] tracking-[-0.02em] sm:text-[32px]">
          {question.question}
        </h2>

        <div className="mt-6 grid gap-2.5" role="group" aria-label="Answer choices">
          {optionKeys.map((key) => {
            const isSelected = selected === key;
            const isOfficial = submitted && key === question.answer;
            const isWrong = submitted && isSelected && !isOfficial;

            return (
              <button
                key={key}
                type="button"
                disabled={submitted}
                aria-pressed={isSelected}
                onClick={() => setSelected(key)}
                className={`focus-ring flex min-h-14 w-full items-center gap-3 rounded-xl border px-4 text-left text-[16px] transition-colors ${
                  isSelected && !submitted
                    ? "border-[var(--tint)] bg-[color:var(--tint)/.1]"
                    : "border-[var(--separator)] bg-[var(--surface)]"
                } ${
                  isOfficial
                    ? "border-[var(--success)] bg-[color:var(--success)/.12]"
                    : isWrong
                      ? "border-[var(--danger)] bg-[color:var(--danger)/.1]"
                      : ""
                } disabled:cursor-default`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-[13px] font-semibold uppercase text-[var(--label)]">
                  {key}
                </span>
                <span className="leading-snug">{question.options[key]}</span>
              </button>
            );
          })}
        </div>

        {submitted && (
          <div
            className={`mt-5 rounded-xl border p-4 ${
              correct
                ? "border-[var(--success)] bg-[color:var(--success)/.1]"
                : "border-[var(--danger)] bg-[color:var(--danger)/.1]"
            }`}
            aria-live="polite"
          >
            <p className="text-[15px] font-semibold">
              {correct ? "Correct" : "Not quite"}
            </p>
            <p className="mt-1 text-[14px] text-[var(--secondary)]">
              Official answer: <span className="font-semibold uppercase text-[var(--label)]">{question.answer}</span>
            </p>
            {why && <p className="mt-3 text-[14px] leading-relaxed">{explanation}</p>}
            {!why && (
              <button
                type="button"
                onClick={explain}
                className="focus-ring mt-3 min-h-11 text-[15px] font-semibold text-[var(--tint)]"
              >
                Why?
              </button>
            )}
          </div>
        )}
      </div>

      <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 mt-4 sm:bottom-3">
        <div className="rounded-2xl border border-[var(--separator)] bg-[color:var(--bg)/.92] p-1.5 backdrop-blur-xl">
          <button
            type="button"
            onClick={submitted ? next : submit}
            disabled={!selected}
            className="focus-ring min-h-14 w-full rounded-xl bg-[var(--tint)] px-5 text-[16px] font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitted ? "Continue" : "Check"}
          </button>
        </div>
      </div>

      {showShortcuts && (
        <div className="fixed inset-0 z-30 flex items-end bg-black/30 p-4 sm:items-center sm:justify-center">
          <div className="w-full max-w-sm rounded-2xl bg-[var(--surface)] p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-semibold">Keyboard shortcuts</h3>
              <button
                type="button"
                onClick={() => setShowShortcuts(false)}
                className="focus-ring min-h-11 min-w-11 rounded-full text-xl text-[var(--secondary)]"
                aria-label="Close shortcuts"
              >
                ×
              </button>
            </div>
            <p className="mt-4 text-[15px] leading-7 text-[var(--secondary)]">
              1 / 2 / 3 or A / B / C to answer. Enter or Space to check and continue.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
