import { describe, expect, it } from "vitest";
import {
  credlyJsonCandidates,
  detectFormat,
  guessKind,
  parseOpenBadge,
  toOpenBadge3,
  toWalletBundle,
} from "../lib/wallet/open-badges";
import { SAMPLE_OB2_ASSERTION, SAMPLE_OB3_CREDENTIAL } from "../lib/wallet/demo-data";

describe("open badges import", () => {
  it("parses an Open Badges 2.0 hosted assertion", () => {
    const c = parseOpenBadge(JSON.stringify(SAMPLE_OB2_ASSERTION));
    expect(c.name).toBe("SQL for Analysts");
    expect(c.issuer.name).toBe("Example Data School");
    expect(c.verification.level).toBe("hosted");
    expect(c.verification.url).toBe(SAMPLE_OB2_ASSERTION.id);
    expect(c.skills).toEqual(["Business Intelligence", "SQL", "Data Analysis"]);
    expect(c.acceptance).toBe("pending");
    expect(c.issuedOn).toBe("2026-02-11T00:00:00.000Z");
  });

  it("parses an Open Badges 3.0 credential with a proof as signed", () => {
    const c = parseOpenBadge(SAMPLE_OB3_CREDENTIAL as Record<string, unknown>);
    expect(c.kind).toBe("micro-credential");
    expect(c.verification.level).toBe("signed");
    expect(c.verification.format).toBe("ob3");
    expect(c.skills).toEqual(["Python", "Data Visualization"]);
    expect(c.image).toContain("placehold.co");
  });

  it("parses Credly badge JSON", () => {
    const c = parseOpenBadge({
      id: "abc-123",
      state: "accepted",
      issued_at: "2024-05-01T00:00:00Z",
      image_url: "https://images.credly.com/x.png",
      badge_template: {
        name: "Cloud Basics",
        description: "d",
        skills: [{ name: "Cloud Computing" }, { name: "AWS" }],
        issuer: { name: "Acme Cloud", url: "https://acme.example" },
      },
    });
    expect(c.verification.format).toBe("credly");
    expect(c.id).toBe("https://www.credly.com/badges/abc-123");
    expect(c.acceptance).toBe("accepted");
    expect(c.skills).toEqual(["Cloud Computing", "AWS"]);
  });

  it("rejects things that are not badges", () => {
    expect(() => parseOpenBadge("not json")).toThrow(/valid JSON/);
    expect(() => parseOpenBadge({ hello: "world" })).toThrow(/Could not recognize/);
    expect(() => parseOpenBadge({ type: "Assertion", badge: {}, recipient: {} })).toThrow(
      /badge.name/,
    );
  });

  it("detects formats", () => {
    expect(detectFormat(SAMPLE_OB2_ASSERTION as Record<string, unknown>)).toBe("ob2");
    expect(detectFormat(SAMPLE_OB3_CREDENTIAL as Record<string, unknown>)).toBe("ob3");
    expect(detectFormat({ badge_template: {} })).toBe("credly");
    expect(detectFormat({})).toBeNull();
  });

  it("guesses kinds from names", () => {
    expect(guessKind("Bachelor of Science")).toBe("degree");
    expect(guessKind("AWS Certified Developer")).toBe("certificate");
    expect(guessKind("Texas Notary License")).toBe("license");
    expect(guessKind("Something")).toBe("badge");
  });

  it("maps Credly page URLs to JSON candidates", () => {
    expect(credlyJsonCandidates("https://www.credly.com/badges/3f2a9c1e-abc/public_url")).toEqual([
      "https://www.credly.com/badges/3f2a9c1e-abc/json",
      "https://www.credly.com/badges/3f2a9c1e-abc.json",
    ]);
    expect(credlyJsonCandidates("https://example.org/x")).toEqual([]);
  });
});

describe("open badges export", () => {
  it("re-exports as an OB3 credential and round-trips through the parser", () => {
    const c = parseOpenBadge(JSON.stringify(SAMPLE_OB2_ASSERTION));
    const ob3 = toOpenBadge3(c, { name: "Jordan", email: "j@example.com" });
    expect(ob3.type).toEqual(["VerifiableCredential", "OpenBadgeCredential"]);
    const back = parseOpenBadge(ob3);
    expect(back.name).toBe(c.name);
    expect(back.issuer.name).toBe(c.issuer.name);
    expect(back.skills).toEqual(c.skills);
  });

  it("bundles a wallet as a presentation, keeping originals", () => {
    const c = parseOpenBadge(JSON.stringify(SAMPLE_OB2_ASSERTION));
    const bundle = toWalletBundle([c], { name: "Jordan" });
    expect(bundle.type).toEqual(["VerifiablePresentation"]);
    expect((bundle.verifiableCredential as unknown[])[0]).toEqual(SAMPLE_OB2_ASSERTION);
  });
});
