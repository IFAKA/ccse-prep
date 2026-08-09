import type { ManualChunk } from "@/data/manualKnowledge";
import type { AnswerKey, Question } from "@/data/questions";

const answerLabel = (answer: AnswerKey) => answer.toUpperCase();

export function buildExternalAiPrompt({
  question,
  selectedAnswer,
  manualChunks,
  misconceptionSummary,
}: {
  question: Question;
  selectedAnswer?: AnswerKey;
  manualChunks: readonly ManualChunk[];
  misconceptionSummary?: string;
}) {
  const options = (Object.entries(question.options) as [AnswerKey, string][])
    .map(([key, text]) => `${answerLabel(key)}. ${text}`)
    .join("\n");
  const manualContext = manualChunks
    .map(
      (chunk) =>
        `### ${chunk.title}\nManual pages: ${chunk.pages.join(", ")}\n${chunk.text}`,
    )
    .join("\n\n");

  return `You are my deep CCSE 2026 study tutor. Use the supplied manual context as the source of truth for teaching. Do not change the official answer or invent a different grading result.

Question ${question.id} (Task ${question.task}):
${question.question}

Options:
${options}

My answer: ${selectedAnswer ? answerLabel(selectedAnswer) : "Not answered"}
Official answer: ${answerLabel(question.answer)}
Previous misconception summary: ${misconceptionSummary || "None recorded"}
Official manual page for this question: ${question.page}

Relevant manual context:
${manualContext || "No manual context was available. Say so clearly instead of guessing."}

Please teach this deeply:
1. Explain why the official answer is correct.
2. Explain why each other option is incorrect.
3. Explain the underlying civic concept in simple language.
4. Identify the likely misunderstanding in my answer, if I was wrong.
5. Give me a memorable example or mnemonic.
6. Ask me one follow-up question to check my understanding.

Keep the official answer authoritative. Cite the supplied manual page numbers when making factual claims.`;
}
