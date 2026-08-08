import {describe,expect,it} from "vitest";
import {validateSyncEvents} from "@/lib/sync";
const event={eventId:"e1",deviceId:"d1",timestamp:1,type:"ANSWER_RECORDED" as const,payload:{questionId:1001,correct:true,responseMs:10}};
describe("nearby sync validation",()=>{it("accepts valid event logs",()=>expect(validateSyncEvents([event])).toEqual([event]));it("rejects unknown event types",()=>expect(()=>validateSyncEvents([{...event,type:"UNKNOWN"}])).toThrow());it("rejects oversized logs",()=>expect(()=>validateSyncEvents(new Array(10001).fill(event))).toThrow())});
