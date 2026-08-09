import type { Question, Task } from "@/data/questions"; import type { AppState } from "./types";
export type Readiness = {ready:boolean; conditions:{label:string; met:boolean; detail:string}[]};
export function readiness(state:AppState, questions:readonly Question[]):Readiness {
  const seen=questions.filter(q=>state.questionStates[q.id]?.attempts>0).length; const recent=state.events.filter(e=>e.type === "ANSWER_RECORDED").map(e=>({t:e.timestamp,ok:Boolean(e.payload.correct)})).sort((a,b)=>b.t-a.t).slice(0,300); const accuracy=recent.length?recent.filter(x=>x.ok).length/recent.length:0;
  const weakTasks=( [1,2,3,4,5] as Task[]).filter(task=>{const xs=questions.filter(q=>q.task===task);const weak=xs.filter(q=>state.questionStates[q.id]?.status==="weak").length;return weak/xs.length>0.2});
  const mocks=[...state.mockHistory].sort((a,b)=>b.timestamp-a.timestamp).slice(0,10); const mockMet=mocks.length>=10&&mocks.every(m=>m.score>=20);
  const conditions=[{label:"Full bank encountered",met:seen===300,detail:`${seen}/300 encountered`},{label:"Recent full-bank accuracy",met:recent.length>=300&&accuracy>=.95,detail:`${Math.round(accuracy*100)}% recent accuracy`},{label:"No seriously weak task",met:weakTasks.length===0,detail:weakTasks.length?`Task ${weakTasks.join(", ")} needs review`:"All tasks within threshold"},{label:"Last 10 fresh mocks",met:mockMet,detail:`${mocks.length}/10 mocks at 20/25+`}];
  return {ready:conditions.every(c=>c.met),conditions};
}
