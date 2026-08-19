import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    // Les suites CLI lancent `pnpm exec tsx` dans leurs hooks : le cold start
    // dépasse régulièrement les 10 s par défaut sur une machine chargée.
    hookTimeout: 60_000,
    testTimeout: 30_000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
