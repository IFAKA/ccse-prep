import { describe, expect, it } from "vitest";
import { questions } from "@/data/questions";
import { chunksForQuestion } from "@/data/manualKnowledge";
import { buildExternalAiPrompt } from "@/lib/aiPrompt";

describe("buildExternalAiPrompt", () => {
  it("creates a self-contained deep-dive prompt", () => {
    const question = questions[0];
    const chunks = chunksForQuestion(question.task);
    const prompt = buildExternalAiPrompt({
      question,
      selectedAnswer: "b",
      manualChunks: chunks,
    });

    expect(prompt).toContain("España es…");
    expect(prompt).toContain("A. una monarquía parlamentaria.");
    expect(prompt).toContain("My answer: B");
    expect(prompt).toContain("Official answer: A");
    expect(prompt).toContain("Manual pages: 18, 19, 20, 21, 22, 23, 24, 25, 26");
    expect(prompt).toContain(chunks[0].text);
    expect(prompt).toContain("Ask me one follow-up question");
  });
});
