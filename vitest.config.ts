import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
const root = dirname(fileURLToPath(import.meta.url));
export default defineConfig({ resolve: { alias: { "@": resolve(root, "src") } }, test: { environment: "node", exclude: ["node_modules/**", "tests/ui.spec.ts", "tests/e2e/**"] } });
