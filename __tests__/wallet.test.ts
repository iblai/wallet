import { describe, expect, it } from "vitest";
import {
  linkedInAddToProfileUrl,
  handleFromName,
  HANDLE_RE,
  shareBlurb,
} from "../lib/wallet/share";
import { walletHealth } from "../lib/wallet/health";
import {
  credentialStatus,
  daysUntilExpiry,
  newId,
  WALLET_SETTINGS_DEFAULTS,
  type WalletCredential,
  type WalletState,
} from "../lib/wallet/types";
import { DEMO_CREDENTIALS, DEMO_PROFILE } from "../lib/wallet/demo-data";
import { deriveState, fromAssertion, platformRows } from "../lib/wallet/derive";
import {
  autoSummary,
  buildResume,
  resumeToMarkdown,
  resumeToText,
  summaryPrompt,
} from "../lib/wallet/resume";

const base = (over: Partial<WalletCredential> = {}): WalletCredential => ({
  id: "c1",
  source: "imported",
  kind: "certificate",
  name: "Cert",
  issuer: { name: "Issuer" },
  skills: [],
  acceptance: "accepted",
  visibility: "public",
  verification: { level: "hosted", url: "https://issuer.example/a/1" },
  collections: [],
  addedAt: "2025-01-01T00:00:00.000Z",
  ...over,
});

describe("credential status", () => {
  it("orders revoked > declined > expired > pending > active", () => {
    const now = new Date("2026-01-01");
    expect(credentialStatus(base({ revoked: true, acceptance: "pending" }), now)).toBe("revoked");
    expect(credentialStatus(base({ acceptance: "declined", expires: "2020-01-01" }), now)).toBe(
      "declined",
    );
    expect(credentialStatus(base({ expires: "2020-01-01", acceptance: "pending" }), now)).toBe(
      "expired",
    );
    expect(credentialStatus(base({ acceptance: "pending" }), now)).toBe("pending");
    expect(credentialStatus(base(), now)).toBe("active");
    expect(daysUntilExpiry(base({ expires: "2026-01-11" }), now)).toBe(10);
    expect(daysUntilExpiry(base(), now)).toBeNull();
  });

  it("mints prefixed ids that never repeat", () => {
    expect(newId("cred")).toMatch(/^cred_/);
    expect(newId()).not.toBe(newId());
  });
});

describe("sharing", () => {
  it("builds LinkedIn's add-to-profile link", () => {
    const url = new URL(
      linkedInAddToProfileUrl(
        base({ issuedOn: "2024-03-10T00:00:00Z", expires: "2027-03-10T00:00:00Z" }),
        "https://w/verify/c1",
      ),
    );
    expect(url.hostname).toBe("www.linkedin.com");
    expect(url.searchParams.get("startTask")).toBe("CERTIFICATION_NAME");
    expect(url.searchParams.get("issueYear")).toBe("2024");
    expect(url.searchParams.get("issueMonth")).toBe("3");
    expect(url.searchParams.get("expirationYear")).toBe("2027");
    expect(url.searchParams.get("certUrl")).toBe("https://w/verify/c1");
    expect(url.searchParams.get("organizationName")).toBe("Issuer");
  });

  it("writes a blurb and valid handles", () => {
    expect(shareBlurb(base({ skills: ["SQL"] }), "https://x")).toContain(
      "Verify it here: https://x",
    );
    expect(shareBlurb(base({ issuedOn: "2024-03-15T00:00:00Z" }))).toMatch(/ in [^.]*2024\b/);
    expect(handleFromName("Jordan Rivera")).toBe("jordan-rivera");
    expect(HANDLE_RE.test("jordan-rivera")).toBe(true);
    expect(HANDLE_RE.test("-bad")).toBe(false);
  });
});

function demoState(): WalletState {
  return deriveState({
    profile: DEMO_PROFILE,
    settings: {
      ...WALLET_SETTINGS_DEFAULTS,
      credentials: DEMO_CREDENTIALS,
      targetRoleId: "data-scientist",
      selfSkills: [{ name: "Communication", level: 4 }],
      desiredSkills: ["Deep Learning"],
      education: [{ id: "e", institution: "WGU", degree: "B.S." }],
      experience: [
        { id: "x", company: "Acme", title: "Analyst", startDate: "2022-01-01", current: true },
      ],
    },
    platformCredentials: [],
    platformEducation: [],
    platformExperience: [],
    platformEarnedSkills: [{ name: "SQL", points: 100 }],
    isLoading: false,
    isDemo: true,
  });
}

describe("derived wallet state", () => {
  it("merges skills from credentials, platform points, self ratings and goals", () => {
    const s = demoState();
    const sql = s.skills.find((k) => k.name === "SQL")!;
    expect(sql.points).toBe(100);
    expect(sql.evidence.length).toBeGreaterThan(1);
    expect(s.skills.find((k) => k.name === "Communication")!.level).toBe(4);
    expect(s.skills.find((k) => k.name === "Deep Learning")!.origin).toBe("desired");
    // Pending credentials do not contribute skills yet.
    expect(s.skills.find((k) => k.name === "Prompt Engineering")).toBeUndefined();
  });

  it("keeps a skill's origin when a later source adds points or a level", () => {
    const s = deriveState({
      profile: DEMO_PROFILE,
      settings: {
        ...WALLET_SETTINGS_DEFAULTS,
        credentials: [base({ id: "c-sql", skills: ["SQL"] })],
        selfSkills: [
          { name: "SQL", level: 3 },
          { name: "Excel", level: 5 },
        ],
      },
      platformCredentials: [],
      platformEducation: [],
      platformExperience: [],
      platformEarnedSkills: [{ name: "SQL", points: 100 }],
      isLoading: false,
      isDemo: true,
    });
    expect(s.skills.find((k) => k.name === "SQL")).toMatchObject({
      origin: "credential",
      points: 100,
      level: 3,
    });
    expect(s.skills.find((k) => k.name === "Excel")!.origin).toBe("self");
    expect(demoState().skills.every((k) => !!k.origin)).toBe(true);
  });

  it("scores wallet health and counts what needs attention", () => {
    const h = walletHealth(demoState());
    expect(h.pendingCount).toBe(1);
    expect(h.expiringSoon).toBe(1);
    expect(h.verifiedCount).toBeGreaterThanOrEqual(4);
    expect(h.score).toBeGreaterThan(50);
    expect(h.checks.find((c) => c.id === "accepted")!.done).toBe(false);
  });
});

describe("credentials from every platform", () => {
  const issued = (entityId: string, org: string, name: string) =>
    fromAssertion({
      entityId,
      issuedOn: "2026-01-01",
      credentialDetails: { name: `Badge ${entityId}`, issuerDetails: { name, org } },
    });

  it("keeps the issuing platform of an assertion", () => {
    expect(issued("a1", "acme", "Acme University").issuer).toMatchObject({
      name: "Acme University",
      org: "acme",
    });
  });

  it("lists every platform the user belongs to, and the issuers outside the list", () => {
    const rows = platformRows(
      [
        { key: "acme", org: "acme", platform_name: "Acme University" },
        { key: "beta-key", org: "beta", platform_name: "Beta College" },
      ],
      [
        issued("a1", "acme", "Acme University"),
        issued("a2", "acme", "Acme University"),
        issued("m1", "main", "ibl.ai"),
        base({ id: "self-1", source: "self" }),
      ],
    );
    expect(rows.map((r) => [r.name, r.credentials.map((c) => c.id)])).toEqual([
      ["Acme University", ["a1", "a2"]],
      ["Beta College", []],
      ["ibl.ai", ["m1"]],
    ]);
  });
});

describe("résumé", () => {
  it("builds a résumé with the expected sections", () => {
    const doc = buildResume(demoState(), "https://w");
    expect(doc.sections.map((s) => s.id)).toEqual([
      "summary",
      "skills",
      "experience",
      "credentials",
      "education",
    ]);
    const md = resumeToMarkdown(doc);
    expect(md).toContain("# Jordan Rivera");
    expect(md).toContain("[verify](https://w/verify/");
    expect(resumeToText(doc)).toContain("LICENSES & CERTIFICATIONS");
    expect(autoSummary(demoState())).toMatch(/Data Scientist roles/);
  });

  it("opens the summary with a headline only when there is one", () => {
    const thin = (credentials: WalletCredential[] = []) =>
      deriveState({
        profile: { username: "jane", name: "Jane Doe" },
        settings: { ...WALLET_SETTINGS_DEFAULTS, credentials },
        platformCredentials: [],
        platformEducation: [],
        platformExperience: [],
        platformEarnedSkills: [],
        isLoading: false,
        isDemo: false,
      });
    expect(autoSummary(thin())).toBe("");
    expect(buildResume(thin(), "https://w").sections.map((s) => s.id)).not.toContain("summary");
    expect(autoSummary(thin([base()]))).toMatch(/^Holds 1 credential/);
  });

  it("hands the summary prompt the facts of the record, and only those", () => {
    const s = demoState();
    const [system, user] = summaryPrompt(s);
    expect(system.role).toBe("system");
    expect(system.content).toMatch(/never invent an employer/);
    expect(system.content).toMatch(/never say that the record is empty/i);
    expect(user.content).toContain(`Name: ${s.profile.name}`);
    expect(user.content).toContain(`About: ${s.profile.about}`);
    expect(user.content).toContain("Target role: Data Scientist");
    expect(user.content).toContain("Learning: Deep Learning");
    const active = s.credentials.filter((c) => credentialStatus(c) === "active");
    expect(user.content).toContain(`Credential: ${active[0].name} from ${active[0].issuer.name}`);
    const pending = s.credentials.find((c) => credentialStatus(c) === "pending")!;
    expect(user.content).toContain(`Credential (awaiting acceptance): ${pending.name} from`);
    expect(user.content).not.toContain(`Credential: ${pending.name} from`);
    // A rich record gets no new-record instruction.
    expect(user.content).not.toContain("This record is new");
  });

  it("asks for an editable opener when the record is new", () => {
    const s = deriveState({
      profile: { username: "jane", name: "Jane Doe" },
      settings: {
        ...WALLET_SETTINGS_DEFAULTS,
        targetRoleId: "data-scientist",
        desiredSkills: ["SQL", "Python"],
      },
      platformCredentials: [],
      platformEducation: [],
      platformExperience: [],
      platformEarnedSkills: [],
      isLoading: false,
      isDemo: false,
    });
    const [, user] = summaryPrompt(s);
    expect(user.content).toContain("This record is new");
    expect(user.content).toContain("Learning: SQL, Python");
    expect(user.content).toContain("Target role: Data Scientist");
    expect(user.content).not.toMatch(/^(Role|Education|Credential|Skills):/m);
  });
});

describe("share fragments", () => {
  it("round-trips a snapshot through base64url and builds self-contained links", async () => {
    const { encodeFragment, decodeFragment, publicPageLink, verifyLink, summarizeCredential } =
      await import("../lib/wallet/share");
    const snap = {
      v: 1 as const,
      org: "acme",
      username: "jane",
      profile: { name: "Jane Ünïcode" },
      platformIds: ["abc"],
      credentials: [summarizeCredential(base({ description: "x".repeat(400) }))],
    };
    const enc = encodeFragment(snap);
    expect(enc).not.toMatch(/[+/=]/);
    const back = decodeFragment<typeof snap>(enc)!;
    expect(back.profile.name).toBe("Jane Ünïcode");
    expect(back.credentials[0].description!.length).toBeLessThanOrEqual(280);
    expect(publicPageLink(snap, "https://w", "col1")).toMatch(
      /^https:\/\/w\/p\/acme\/jane\?collection=col1#d=/,
    );
    expect(
      verifyLink(base({ source: "platform" }), "https://w", { org: "acme", username: "jane" }),
    ).toBe("https://w/verify/c1?org=acme&u=jane");
    expect(verifyLink(base(), "https://w", { org: "acme", username: "jane" })).toMatch(/#c=/);
    expect(decodeFragment("not*valid")).toBeNull();
  });
});
