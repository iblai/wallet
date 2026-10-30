import { describe, expect, it } from "vitest";
import { DEMO_PROFILE } from "../lib/wallet/demo-data";
import { deriveState } from "../lib/wallet/derive";
import { isSampleWallet } from "../lib/wallet/sample";
import { WALLET_SETTINGS_DEFAULTS } from "../lib/wallet/types";

describe("isSampleWallet", () => {
  it("shows the sample to a user whose only organization is the community one", () => {
    expect(isSampleWallet("main", [{ key: "main", is_admin: false }], "main")).toBe(true);
    expect(isSampleWallet("main", [{ key: "main" }], "main")).toBe(true);
  });

  it("shows everyone else their own wallet", () => {
    expect(isSampleWallet("main", [{ key: "main", is_admin: true }], "main")).toBe(false);
    expect(isSampleWallet("main", [{ key: "main" }, { key: "acme" }], "main")).toBe(false);
    expect(isSampleWallet("acme", [{ key: "acme" }], "main")).toBe(false);
    expect(isSampleWallet("main", [], "main")).toBe(false);
    expect(isSampleWallet("", [{ key: "" }], "")).toBe(false);
  });
});

describe("deriveState", () => {
  const inputs = {
    profile: DEMO_PROFILE,
    settings: WALLET_SETTINGS_DEFAULTS,
    platformCredentials: [],
    platformEducation: [],
    platformExperience: [],
    platformEarnedSkills: [],
    isLoading: false,
    isDemo: true,
  };

  it("marks the sample, and nothing else, as the sample", () => {
    expect(deriveState({ ...inputs, isSample: true }).isSample).toBe(true);
    expect(deriveState(inputs).isSample).toBe(false);
  });
});
