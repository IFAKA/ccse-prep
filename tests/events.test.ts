import {describe,expect,it} from "vitest"; import {blankState,reduceEvent} from "@/lib/events";
const e=(id:string)=>({eventId:id,deviceId:'test',timestamp:1,type:'ANSWER_RECORDED' as const,payload:{questionId:1001,correct:true,responseMs:10}});
describe('event reduction',()=>{it('deduplicates event ids',()=>{const one=reduceEvent(blankState(),e('a'));expect(reduceEvent(one,e('a')).events).toHaveLength(1)});it('derives learning state',()=>expect(reduceEvent(blankState(),e('a')).questionStates[1001].correct).toBe(1))});
