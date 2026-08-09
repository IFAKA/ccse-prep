import type { Question, AnswerKey } from "@/data/questions";
import type { QuestionState } from "./types";
export const emptyState = ():QuestionState => ({attempts:0,correct:0,incorrect:0,consecutiveCorrect:0,status:"unseen"});
export function recordAnswer(previous:QuestionState|undefined, isCorrect:boolean, now=Date.now(), responseMs=0):QuestionState {
  const s = previous ?? emptyState(); const attempts=s.attempts+1; const correct=s.correct+(isCorrect?1:0); const incorrect=s.incorrect+(isCorrect?0:1); const consecutive=isCorrect?s.consecutiveCorrect+1:0;
  const retrievals = isCorrect ? [...(s.retrievals ?? []), now].slice(-3) : [];
  const separated = retrievals.length >= 3 && retrievals[1] - retrievals[0] >= 24 * 60 * 60 * 1000 && retrievals[2] - retrievals[1] >= 24 * 60 * 60 * 1000;
  const status = !isCorrect ? "weak" : separated ? "mastered" : "learning";
  const gap = !isCorrect ? 5 : consecutive===1 ? 0 : consecutive===2 ? 1 : consecutive===3 ? 3 : 7;
  return {...s, attempts, correct, incorrect, consecutiveCorrect:consecutive, retrievals, firstSeenAt:s.firstSeenAt??now, lastSeenAt:now, lastResponseMs:responseMs, nextReviewAt:now+(gap*24*60*60*1000), status};
}
export function due(s:QuestionState|undefined, now=Date.now()) { return !s || s.status === "unseen" || !s.nextReviewAt || s.nextReviewAt <= now; }
export function selectNext(questions:readonly Question[], states:Record<number,QuestionState>, now=Date.now(), exclude=new Set<number>()):Question {
  const rank=(q:Question) => { const s=states[q.id]; if (exclude.has(q.id)) return 99; if (!s || s.status==="unseen") return 0; if (s.status==="weak" && due(s,now)) return 1; if (s.status==="learning" && due(s,now)) return 2; if (s.status==="mastered" && due(s,now)) return 3; return 4; };
  return [...questions].sort((a,b)=>rank(a)-rank(b)||a.id-b.id)[0];
}
export function grade(q:Question, answer:AnswerKey) { return q.answer === answer; }
