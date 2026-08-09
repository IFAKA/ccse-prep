import raw from "./ccse-2026-questions.json";

export type AnswerKey = "a" | "b" | "c";
export type Task = 1 | 2 | 3 | 4 | 5;
export type Question = Readonly<{ id:number; task:Task; question:string; options:Readonly<Partial<Record<AnswerKey,string>>>; answer:AnswerKey; page:number }>;

const expected: Record<Task, number> = {1:120,2:36,3:24,4:36,5:84};
function validate(input: typeof raw): readonly Question[] {
  if (input.count !== 300 || input.questions.length !== 300) throw new Error("Official dataset must contain 300 questions");
  const ids = new Set<number>(); const counts = {1:0,2:0,3:0,4:0,5:0} as Record<Task,number>;
  for (const q of input.questions) {
    if (ids.has(q.id)) throw new Error(`Duplicate question id ${q.id}`); ids.add(q.id);
    if (!(q.task in expected)) throw new Error(`Invalid task for ${q.id}`);
    counts[q.task as Task]++;
    if (!q.question.trim() || !q.options.a?.trim() || !q.options.b?.trim() || (q.options.c !== undefined && !q.options.c.trim())) throw new Error(`Invalid question ${q.id}`);
    if (!(q.answer in q.options)) throw new Error(`Official answer missing from options for ${q.id}`);
  }
  for (const task of [1,2,3,4,5] as Task[]) if (counts[task] !== expected[task]) throw new Error(`Task ${task} count mismatch`);
  const freeze = <T>(value: T): T => {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      Object.values(value as Record<string, unknown>).forEach(freeze);
      Object.freeze(value);
    }
    return value;
  };
  return freeze(input.questions) as readonly Question[];
}
export const questions = validate(raw);
export const questionById = new Map(questions.map(q => [q.id, q]));
