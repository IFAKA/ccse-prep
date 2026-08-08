"use client";

import { useCallback, useEffect, useState } from "react";
import { questions, type AnswerKey, type Question, type Task } from "@/data/questions";
import { chunksForQuestion } from "@/data/manualKnowledge";
import { makeEvent, reduceEvent } from "@/lib/events";
import { appendEvent } from "@/lib/storage";
import { grade, selectNext } from "@/lib/scheduler";
import type { AppState } from "@/lib/types";
import { buildExternalAiPrompt } from "@/lib/aiPrompt";
import { PageHeader, SurfaceCard } from "./PageLayout";
import { playUiSound } from "@/lib/sound";

const taskLabels: Record<Task, string> = {
  1: "Government, legislation and citizen participation",
  2: "Fundamental rights and duties",
  3: "Spain's territorial organization and physical and political geography",
  4: "Culture and history of Spain",
  5: "Spanish society",
};

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
  const [aiStatus, setAiStatus] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [closingShortcuts, setClosingShortcuts] = useState(false);

  const closeShortcuts = useCallback(() => {
    if (!showShortcuts || closingShortcuts) return;
    setClosingShortcuts(true);
    window.setTimeout(() => {
      setShowShortcuts(false);
      setClosingShortcuts(false);
    }, 180);
  }, [closingShortcuts, showShortcuts]);

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
    playUiSound(grade(question, selected) ? "correct" : "incorrect");
  }, [question, selected, startedAt, state, submitted, update]);

  const next = useCallback(() => {
    setQuestion(
      selectNext(questions, state.questionStates, Date.now(), new Set([question.id])),
    );
    setSelected(undefined);
    setSubmitted(false);
    setAiStatus("");
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

      if (event.key === "?") {
        setClosingShortcuts(false);
        setShowShortcuts(true);
      }
      if (event.key === "Escape") closeShortcuts();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeShortcuts, next, question.options, submit, submitted]);

  const correct = submitted && selected ? grade(question, selected) : false;
  const optionKeys = Object.keys(question.options) as AnswerKey[];

  const askExternalAi = async () => {
    const prompt = buildExternalAiPrompt({
      question,
      selectedAnswer: selected,
      manualChunks: chunksForQuestion(question.task),
    });

    try {
      if (navigator.share) {
        await navigator.share({
          title: `CCSE 2026 · Question ${question.id}`,
          text: prompt,
        });
        setAiStatus("Prompt shared. Choose ChatGPT or another AI app.");
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(prompt);
        setAiStatus("Full prompt copied. Paste it into ChatGPT or another AI app.");
      } else {
        setAiStatus("Sharing is unavailable in this browser. Select and copy the prompt from a supported browser.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;

      setAiStatus("Could not share automatically. Use the copy fallback in your browser.");
    }
  };

  return (
    <section className="view-enter pb-[calc(9rem+env(safe-area-inset-bottom))] sm:pb-0">
      <PageHeader
        eyebrow={taskLabels[question.task]}
        title={`Question ${question.id}`}
        aside={
          <span className="rounded-full bg-[var(--surface-2)] px-3 py-1.5 text-xs font-medium text-[var(--secondary)]">
            {state.questionStates[question.id]?.status ?? "unseen"}
          </span>
        }
      />

      <SurfaceCard className="mt-7 p-4 sm:mt-9 sm:p-6">
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
                onClick={(event) => { setSelected(key); if (event.detail > 0) playUiSound("select"); }}
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
            className={`answer-feedback mt-5 rounded-xl border p-4 ${
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
            <button
              type="button"
              onClick={askExternalAi}
              className="focus-ring mt-3 block min-h-11 text-left text-[15px] font-semibold text-[var(--tint)]"
            >
              Ask AI With Full Context
            </button>
            <p className="mt-2 text-[12px] leading-relaxed text-[var(--secondary)]">
              Opens your Android share menu so you can choose ChatGPT or another AI app.
            </p>
            {aiStatus && (
              <p className="mt-2 text-[13px] text-[var(--secondary)]" aria-live="polite">
                {aiStatus}
              </p>
            )}
          </div>
        )}
      </SurfaceCard>

      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 mt-4 sm:sticky sm:bottom-3">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--separator)] bg-[color:var(--bg)/.92] p-1.5 backdrop-blur-xl sm:mx-0">
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
        <div className={`shortcut-backdrop fixed inset-0 z-30 flex items-end p-4 sm:items-center sm:justify-center ${closingShortcuts ? "is-closing" : ""}`}>
          <div className={`shortcut-dialog w-full max-w-sm rounded-2xl bg-[var(--surface)] p-5 shadow-xl ${closingShortcuts ? "is-closing" : ""}`} role="dialog" aria-modal="true" aria-labelledby="shortcuts-title">
            <div className="flex items-center justify-between">
              <h3 id="shortcuts-title" className="text-[17px] font-semibold">Keyboard Shortcuts</h3>
              <button
                type="button"
                onClick={closeShortcuts}
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
