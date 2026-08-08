import fs from "node:fs";
const data = JSON.parse(fs.readFileSync(new URL("../ccse-2026-questions.json", import.meta.url)));
const expected = {1:120,2:36,3:24,4:36,5:84};
if (data.count !== 300 || data.questions?.length !== 300) throw new Error("CCSE dataset must contain exactly 300 questions");
const ids = new Set(); const counts = {1:0,2:0,3:0,4:0,5:0};
for (const q of data.questions) {
  if (ids.has(q.id)) throw new Error(`Duplicate question id ${q.id}`); ids.add(q.id);
  if (!expected[q.task]) throw new Error(`Invalid task on ${q.id}`); counts[q.task]++;
  if (!q.question?.trim() || !q.options || !["a","b"].every(k => q.options[k]?.trim()) || (q.options.c !== undefined && !q.options.c.trim())) throw new Error(`Invalid options on ${q.id}`);
  if (!q.options[q.answer]) throw new Error(`Answer ${q.answer} missing from ${q.id}`);
}
for (const task of Object.keys(expected)) if (counts[task] !== expected[task]) throw new Error(`Task ${task} count mismatch`);
console.log(`Validated ${ids.size} CCSE questions`);
