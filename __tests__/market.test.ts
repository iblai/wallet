import { describe, expect, it } from "vitest";
import { canonicalSkill, gapAnalysis, rankRoles, roleById, searchSkills } from "../lib/wallet/market";
import type { WalletSkill } from "../lib/wallet/types";

const sk = (name: string, origin: WalletSkill["origin"] = "credential"): WalletSkill => ({ name, origin, evidence: ["x"] });

describe("skill taxonomy", () => {
  it("canonicalizes aliases and casing", () => {
    expect(canonicalSkill("js")).toBe("JavaScript");
    expect(canonicalSkill("python programming")).toBe("Python");
    expect(canonicalSkill("sql")).toBe("SQL");
    expect(canonicalSkill("data analysis")).toBe("Data Analysis");
    expect(canonicalSkill("llms")).toBe("Generative AI");
  });

  it("searches by prefix, substring and alias", () => {
    expect(searchSkills("pyth")[0]).toBe("Python");
    expect(searchSkills("k8s")).toContain("Kubernetes");
    expect(searchSkills("", 3)).toHaveLength(3);
  });
});

describe("gap analysis", () => {
  it("weights core skills and lists gaps most important first", () => {
    const role = roleById("data-analyst")!;
    const g = gapAnalysis(role, [sk("SQL"), sk("data analysis"), sk("Excel")]);
    expect(g.coverage).toBeGreaterThan(30);
    expect(g.coverage).toBeLessThan(60);
    expect(g.matched.map((m) => m.skill)).toEqual(["SQL", "Data Analysis", "Excel"]);
    expect(g.gaps[0].weight).toBe(3);
    expect(g.gaps[0].skill).toBe("Data Visualization");
    expect(g.nextCredentials.length).toBeGreaterThan(0);
  });

  it("ignores desired skills and reports extras", () => {
    const role = roleById("data-analyst")!;
    const g = gapAnalysis(role, [sk("SQL"), sk("Python", "desired"), sk("Nursing")]);
    expect(g.matched.map((m) => m.skill)).toEqual(["SQL"]);
    expect(g.extras).toEqual(["Nursing"]);
  });

  it("ranks roles by coverage", () => {
    const ranked = rankRoles([sk("Patient Care"), sk("Nursing"), sk("Clinical Assessment")]);
    expect(ranked[0].role.id).toBe("registered-nurse");
  });
});
