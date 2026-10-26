import { describe, it, expect } from "vitest";
import {
  APP_SLUG,
  mergeAppNamespace,
  platformDefaultAgentId,
  readAppNamespace,
} from "../lib/iblai/metadata-core";

/**
 * lib/iblai/metadata-core.ts — the namespace rules both stores rely on:
 * everything this app writes lives under `apps.<slug>`, and a merge never
 * drops keys that belong to the OS or to other apps (the org metadata PUT
 * replaces the whole object, so this is what keeps it safe).
 */

describe("APP_SLUG", () => {
  it("is the wallet's own fixed key", () => {
    expect(APP_SLUG).toBe("credential-wallet");
  });
});

describe("readAppNamespace", () => {
  it("returns this app's object, or {} when absent or malformed", () => {
    expect(readAppNamespace(null)).toEqual({});
    expect(readAppNamespace({})).toEqual({});
    expect(readAppNamespace({ apps: { "vibe-starter": { x: 1 } } })).toEqual({});
    expect(readAppNamespace({ apps: { "credential-wallet": "nope" } })).toEqual({});
    expect(readAppNamespace({ apps: { "credential-wallet": { theme: "dark" } } })).toEqual({
      theme: "dark",
    });
  });
});

describe("mergeAppNamespace", () => {
  const os = {
    overall_default_mentor: "abc",
    help_center_url: "https://docs.ibl.ai",
    auth_web_mentorai: { title: "Acme" },
    apps: {
      "vibe-starter": { access: "monthly" },
      "credential-wallet": { theme: "light", onboardingStep: 2 },
    },
  };

  it("merges the patch into this app's namespace only", () => {
    const out = mergeAppNamespace(os, { theme: "dark" });
    expect(out.apps).toEqual({
      "vibe-starter": { access: "monthly" },
      "credential-wallet": { theme: "dark", onboardingStep: 2 },
    });
  });

  it("preserves every key that is not ours (the OS's own settings, other apps)", () => {
    const out = mergeAppNamespace(os, { theme: "dark" });
    expect(out.overall_default_mentor).toBe("abc");
    expect(out.help_center_url).toBe("https://docs.ibl.ai");
    expect(out.auth_web_mentorai).toEqual({ title: "Acme" });
    expect((out.apps as any)["vibe-starter"]).toEqual({ access: "monthly" });
  });

  it("removes only the keys asked for", () => {
    const out = mergeAppNamespace(os, {}, ["onboardingStep"]);
    expect((out.apps as any)["credential-wallet"]).toEqual({ theme: "light" });
  });

  it("does not mutate the input", () => {
    const before = JSON.stringify(os);
    mergeAppNamespace(os, { theme: "dark" }, ["onboardingStep"]);
    expect(JSON.stringify(os)).toBe(before);
  });

  it("starts from scratch when the store is empty", () => {
    expect(mergeAppNamespace(undefined, { a: 1 })).toEqual({
      apps: { "credential-wallet": { a: 1 } },
    });
  });
});

describe("platformDefaultAgentId", () => {
  const id = "0f5b8c1e-2d4a-4c6b-9a8e-1f2e3d4c5b6a";

  it("reads the platform default the DM writes, as an object or as its JSON", () => {
    expect(
      platformDefaultAgentId({
        overall_default_mentor: { name: "AI Mentor", unique_id: id, id: 7 },
      }),
    ).toBe(id);
    expect(
      platformDefaultAgentId({ overall_default_mentor: JSON.stringify({ unique_id: id }) }),
    ).toBe(id);
  });

  it("answers empty when it is absent or malformed", () => {
    expect(platformDefaultAgentId(undefined)).toBe("");
    expect(platformDefaultAgentId({})).toBe("");
    expect(platformDefaultAgentId({ overall_default_mentor: "not json" })).toBe("");
    expect(platformDefaultAgentId({ overall_default_mentor: { unique_id: 7 } })).toBe("");
    expect(platformDefaultAgentId({ overall_default_mentor: null })).toBe("");
  });
});
