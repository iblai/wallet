import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: {
    include: ["__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      // The pure modules the unit tests own; components and the API slices are exercised by e2e.
      include: [
        "lib/iblai/completions.ts",
        "lib/iblai/config.ts",
        "lib/iblai/metadata-core.ts",
        "lib/iblai/sso-redirect.ts",
        "lib/iblai/tenant.ts",
        "lib/wallet/demo-data.ts",
        "lib/wallet/derive.ts",
        "lib/wallet/health.ts",
        "lib/wallet/market.ts",
        "lib/wallet/open-badges.ts",
        "lib/wallet/resume.ts",
        "lib/wallet/share.ts",
        "lib/wallet/types.ts",
      ],
      // The floor measured on 2026-10-23; raise toward the SIS's 95/95/95/90 as the tests grow.
      thresholds: { lines: 80, statements: 80, functions: 80, branches: 55 },
      reporter: ["text-summary"],
    },
  },
});
