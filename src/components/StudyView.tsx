"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { questions, type AnswerKey, type Question, type Task } from "@/data/questions";
import { chunksForQuestion } from "@/data/manualKnowledge";
import { makeEvent, reduceEvent } from "@/lib/events";
import { appendEvent } from "@/lib/storage";
import { grade, selectNext } from "@/lib/scheduler";
import type { AppState } from "@/lib/types";
import { buildExternalAiPrompt } from "@/lib/aiPrompt";
import { PageHeader } from "./PageLayout";
import { playUiSound } from "@/lib/sound";
import { dailyGoalProgress, daysUntilExam } from "@/lib/dailyGoal";

function QuestionCounter({ value }: { value: number }) {
  return (
    <span className="study-question-number" aria-label={`Question ${value}`}>
      Question {value}
    </span>
  );
}

const taskLabels: Record<Task, { compact: string; full: string }> = {
  1: { compact: "Government & Civic Life", full: "Government, legislation and citizen participation" },
  2: { compact: "Rights & Duties", full: "Fundamental rights and duties" },
  3: { compact: "Territory & Geography", full: "Spain's territorial organization and physical and political geography" },
  4: { compact: "Culture & History", full: "Culture and history of Spain" },
  5: { compact: "Spanish Society", full: "Spanish society" },
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
  const shortcutsDialog = useRef<HTMLDialogElement>(null);

  const closeShortcuts = useCallback(() => {
    if (!showShortcuts || closingShortcuts) return;
    setClosingShortcuts(true);
    window.setTimeout(() => {
      setShowShortcuts(false);
      setClosingShortcuts(false);
    }, 180);
  }, [closingShortcuts, showShortcuts]);

  useEffect(() => {
    const dialog = shortcutsDialog.current;
    if (showShortcuts && dialog && !dialog.open) dialog.showModal();
    return () => {
      if (!showShortcuts && dialog?.open) dialog.close();
    };
  }, [showShortcuts]);

  const submit = useCallback(async () => {
    if (!selected || submitted) return;

    const event = makeEvent("ANSWER_RECORDED", {
      questionId: question.id,
      correct: grade(question, selected),
      responseMs: Date.now() - startedAt,
    });

    await appendEvent(event);
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

  const optionKeys = Object.keys(question.options) as AnswerKey[];
  const dailyGoal = dailyGoalProgress(state);
  const isEditableTarget = (target: EventTarget | null) => {
    const element = target as HTMLElement | null;
    return Boolean(element?.closest("input, textarea, select, [contenteditable='true']"));
  };
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;

      const key = event.key.toLowerCase();
      if (key === "g") { window.sessionStorage.setItem("ccse-g-prefix", "1"); return; }
      if (key === "p" && window.sessionStorage.getItem("ccse-g-prefix")) { window.sessionStorage.removeItem("ccse-g-prefix"); window.location.assign("/progress"); return; }
      if (key === "s") { window.location.assign("/study"); return; }
      if (key === "m") { window.location.assign("/mock"); return; }
      if (key === "e") { window.location.assign("/errors"); return; }

      if (["1", "2", "3", "a", "b", "c"].includes(key) && !submitted) {
        const key: AnswerKey =
          event.key === "1" || event.key.toLowerCase() === "a"
            ? "a"
            : event.key === "2" || event.key.toLowerCase() === "b"
              ? "b"
              : "c";
        if (question.options[key]) setSelected(key);
      }

      if ((key === "j" || key === "arrowdown" || key === "k" || key === "arrowup") && !submitted) {
        event.preventDefault();
        const current = selected ? optionKeys.indexOf(selected) : key === "k" || key === "arrowup" ? 0 : -1;
        const delta = key === "j" || key === "arrowdown" ? 1 : -1;
        const nextIndex = Math.max(0, Math.min(optionKeys.length - 1, current + delta));
        setSelected(optionKeys[nextIndex]);
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
  }, [closeShortcuts, next, optionKeys, question.options, selected, submit, submitted]);

  const correct = submitted && selected ? grade(question, selected) : false;
  const askExternalAi = async () => {
    const prompt = buildExternalAiPrompt({
      question,
      selectedAnswer: selected,
      manualChunks: chunksForQuestion(question.task),
      misconceptionSummary: state.questionStates[question.id]?.misconceptionSummary,
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
    <section className="nf-stack">
      <PageHeader
        title={<QuestionCounter value={question.id} />}
        titleMeta={
          <span
            className="study-category"
            data-task={question.task}
            aria-label={taskLabels[question.task].full}
          >
            <span>{taskLabels[question.task].compact}</span>
          </span>
        }
        aside={
          <span
            className="study-status"
            data-status={state.questionStates[question.id]?.status ?? "unseen"}
          >
            {state.questionStates[question.id]?.status ?? "unseen"}
          </span>
        }
      />

      <section className="nf-stack">
        <form className="nf-form">
          <fieldset className="nf-field">
            <legend>{question.question}</legend>
            <div className="nf-choice-list">
              {optionKeys.map((key) => {
            const isSelected = selected === key;
            const isOfficial = submitted && key === question.answer;
            const isWrong = submitted && isSelected && !isOfficial;

            return (
              <label
                key={key}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={key}
                  checked={isSelected}
                  disabled={submitted}
                  onChange={() => { setSelected(key); playUiSound("select"); }}
                />
                <span className="study-option-letter" aria-hidden="true">{key.toUpperCase()}.</span>
                <span>{question.options[key]}</span>
              </label>
              );
            })}
            </div>
          </fieldset>
        </form>

        {submitted && (
          <section
            className="nf-alert"
            data-tone={correct ? "success" : "danger"}
            aria-label="Answer feedback"
            aria-live="polite"
          >
            <div className="nf-stack">
              <p><strong>{correct ? "Correct" : "Not quite"}</strong></p>
              <p>Official answer: <strong>{question.answer.toUpperCase()}</strong></p>
            </div>

            <div className="nf-stack">
          <button className="nf-button" type="button" onClick={askExternalAi}>
                Share With AI
              </button>
              {aiStatus && <p aria-live="polite">{aiStatus}</p>}
            </div>
          </section>
        )}

        <p
          className="daily-goal"
          data-complete={dailyGoal.complete ? "true" : "false"}
          aria-label="Daily study progress"
          aria-live="polite"
        >
          <strong>Today {dailyGoal.answered}/{dailyGoal.target}</strong>
          <span>Streak {dailyGoal.streak}d</span>
          <span>Exam {daysUntilExam()}d</span>
        </p>

      </section>

      <footer className="study-actions nf-mobile-actions nf-viewport-actions">
          <button className="nf-button-primary nf-action-button"
            type="button"
            onClick={submitted ? next : submit}
            disabled={!selected}
          >
            {submitted ? "Continue" : "Check"}
          </button>
      </footer>

      {showShortcuts && (
        <dialog
          ref={shortcutsDialog}
          className="nf-dialog"
          aria-labelledby="shortcuts-title"
          onCancel={(event) => { event.preventDefault(); closeShortcuts(); }}
        >
          <header className="nf-split">
            <h3 id="shortcuts-title">Keyboard Shortcuts</h3>
          <button className="nf-button" type="button" onClick={closeShortcuts}>Close</button>
          </header>
          <p>1 / 2 / 3 or A / B / C to answer. Enter or Space to check and continue.</p>
        </dialog>
      )}
    </section>
  );
}
