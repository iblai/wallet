import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import coverage from "../e2e/coverage.json";

/**
 * e2e/coverage.json ↔ e2e/COVERAGE.md ↔ e2e/journeys — the registry stays honest:
 * every journey's spec exists, every route belongs to a journey, every checkpoint
 * id is in both files, and the summary is the one the entries compute.
 */
const root = fileURLToPath(new URL("..", import.meta.url));
const read = (p: string) => readFileSync(join(root, p), "utf8");
const { journeys } = coverage;
const checkpoints = journeys.flatMap((j) => j.checkpoints.map((c) => ({ ...c, spec: j.spec })));

/** Every app/**\/page.tsx, relative to the repo root. */
function routes(dir = join(root, "app")): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return routes(full);
    return name === "page.tsx" ? [relative(root, full)] : [];
  });
}

describe("e2e coverage registry", () => {
  it("names a spec that exists for every journey", () => {
    const missing = journeys.filter((j) => !existsSync(join(root, "e2e/journeys", j.spec)));
    expect(missing.map((j) => j.spec)).toEqual([]);
  });

  it("maps every route to a journey, through files that exist", () => {
    const mapped = new Set(journeys.flatMap((j) => j.sourceFiles));
    // The SSO landing page has no UI of its own; auth.setup.ts drives it on every run.
    const unmapped = routes().filter(
      (r) => !mapped.has(r) && r !== "app/sso-login-complete/page.tsx",
    );
    expect(unmapped).toEqual([]);
    expect([...mapped].filter((f) => !existsSync(join(root, f)))).toEqual([]);
  });

  it("has unique checkpoint ids, each in COVERAGE.md and in its spec", () => {
    const ids = checkpoints.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    const md = read("e2e/COVERAGE.md");
    const specs = new Map(journeys.map((j) => [j.spec, read(`e2e/journeys/${j.spec}`)]));
    for (const c of checkpoints) {
      expect(md, `${c.id} in COVERAGE.md`).toContain(`_(${c.id}`);
      expect(specs.get(c.spec), `// ${c.id} in ${c.spec}`).toContain(`// ${c.id}`);
    }
  });

  it("carries the summary the entries compute, in both files", () => {
    const covered = checkpoints.filter((c) => c.status === "covered").length;
    const pending = checkpoints.filter((c) => c.status === "pending").length;
    expect(covered + pending).toBe(checkpoints.length);
    expect(coverage.summary).toEqual({
      totalCheckpoints: checkpoints.length,
      coveredCheckpoints: covered,
      pendingCheckpoints: pending,
      percent: Math.round((covered / checkpoints.length) * 100),
      totalJourneys: journeys.length,
    });
    expect(read("e2e/COVERAGE.md")).toContain(
      `> Last updated: ${coverage.lastUpdated} | ${checkpoints.length} checkpoints (${covered} covered, ${pending} pending/fixme) | ${journeys.length} journeys | ${coverage.summary.percent}% covered`,
    );
  });
});
