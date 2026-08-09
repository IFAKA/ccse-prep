import { describe, expect, it } from "vitest";
import { importState, CURRENT_SCHEMA_VERSION } from "@/lib/storage";

describe("local state schema", () => {
  it("rejects future export versions before touching storage", async () => {
    await expect(importState(JSON.stringify({ schemaVersion: CURRENT_SCHEMA_VERSION + 1, events: [] }))).rejects.toThrow("Unsupported");
  });
});
