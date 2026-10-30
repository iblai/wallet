/**
 * Pure derivation of the wallet state — no React, no SDK — shared by the
 * browser provider (lib/wallet/provider.tsx), the public/verify server
 * routes, and the unit tests. Relative imports on purpose: vitest resolves
 * no `@/` alias for lib files.
 */
import config from "../iblai/config";
import { canonicalSkill, skillsFromCredential } from "./market";
import {
  WALLET_SETTINGS_DEFAULTS,
  type WalletCredential,
  type WalletEducation,
  type WalletExperience,
  type WalletProfile,
  type WalletSettings,
  type WalletSkill,
  type WalletState,
} from "./types";

export interface SourceInputs {
  profile: WalletProfile;
  settings: WalletSettings;
  platformCredentials: WalletCredential[];
  platformEducation: WalletEducation[];
  platformExperience: WalletExperience[];
  platformEarnedSkills: { name: string; points?: number }[];
  skillPoints?: { total: number; percentile?: number };
  resumeFileUrl?: string;
  unreachablePlatforms?: string[];
  isLoading: boolean;
  isDemo: boolean;
  isSample?: boolean;
}

export function deriveState(i: SourceInputs): WalletState {
  const settings = {
    ...WALLET_SETTINGS_DEFAULTS,
    ...i.settings,
    resume: { ...WALLET_SETTINGS_DEFAULTS.resume, ...i.settings.resume },
  };
  const overrides = settings.overrides ?? {};
  const platform = i.platformCredentials.map((c) => ({ ...c, ...overrides[c.id] }));
  const own = settings.credentials ?? [];
  // A platform credential the user also stored (demo seeds do this) wins by id, latest first.
  const byId = new Map<string, WalletCredential>();
  for (const c of [...platform, ...own]) byId.set(c.id, c);
  const credentials = [...byId.values()].sort((a, b) =>
    (b.issuedOn ?? b.addedAt).localeCompare(a.issuedOn ?? a.addedAt),
  );

  // Skills: every accepted, unrevoked credential attests its tags; platform
  // earned skills carry points; self-reported carry a level; desired are goals.
  const skills = new Map<string, WalletSkill>();
  const upsert = (name: string, patch: Partial<WalletSkill>, evidence?: string) => {
    const key = canonicalSkill(name);
    const cur = skills.get(key.toLowerCase()) ?? {
      name: key,
      origin: patch.origin ?? "credential",
      evidence: [],
    };
    // A later source may add points or a level without an origin: the stored one stays.
    const { origin, ...rest } = patch;
    const next: WalletSkill = {
      ...cur,
      ...rest,
      ...(origin ? { origin } : {}),
      name: key,
      evidence: evidence ? [...new Set([...cur.evidence, evidence])] : cur.evidence,
    };
    // A skill that is evidenced is never "just desired".
    if (cur.origin !== "desired" && patch.origin === "desired") next.origin = cur.origin;
    skills.set(key.toLowerCase(), next);
  };
  for (const c of credentials) {
    if (c.revoked || c.acceptance !== "accepted") continue;
    for (const s of skillsFromCredential(c)) upsert(s, { origin: "credential" }, c.id);
  }
  for (const s of i.platformEarnedSkills)
    upsert(s.name, {
      origin: skills.has(canonicalSkill(s.name).toLowerCase()) ? undefined : "platform",
      points: s.points,
    });
  for (const s of settings.selfSkills ?? [])
    upsert(s.name, {
      origin: skills.has(canonicalSkill(s.name).toLowerCase()) ? undefined : "self",
      level: s.level,
    });
  for (const s of settings.desiredSkills ?? [])
    if (!skills.has(canonicalSkill(s).toLowerCase())) upsert(s, { origin: "desired" });

  const education = i.isDemo ? (settings.education ?? []) : i.platformEducation;
  const experience = i.isDemo ? (settings.experience ?? []) : i.platformExperience;
  const profile = { ...i.profile, ...(i.isDemo ? settings.profile : {}) } as WalletProfile;

  return {
    profile,
    credentials,
    collections: settings.collections ?? [],
    skills: [...skills.values()].sort(
      (a, b) => b.evidence.length - a.evidence.length || a.name.localeCompare(b.name),
    ),
    desiredSkills: settings.desiredSkills ?? [],
    education,
    experience,
    settings,
    skillPoints: i.skillPoints,
    resumeFileUrl: i.resumeFileUrl,
    unreachablePlatforms: i.unreachablePlatforms,
    isLoading: i.isLoading,
    isDemo: i.isDemo,
    isSample: i.isSample ?? false,
  };
}

export interface PlatformRow {
  org: string;
  name: string;
  credentials: WalletCredential[];
}

/** "Your platforms": each platform the user belongs to, with what it issued them, plus any other issuer (`main`). */
export function platformRows(
  tenants: { key: string; org?: unknown; platform_name?: unknown; name?: unknown }[],
  credentials: WalletCredential[],
): PlatformRow[] {
  const rows = new Map<string, PlatformRow>();
  for (const t of tenants) {
    const org = String(t.org || t.key);
    rows.set(org, { org, name: String(t.platform_name || t.name || t.key), credentials: [] });
  }
  for (const c of credentials) {
    if (c.source !== "platform") continue;
    const org = c.issuer.org ?? "";
    const row = rows.get(org) ?? { org, name: c.issuer.name, credentials: [] };
    row.credentials.push(c);
    rows.set(org, row);
  }
  return [...rows.values()];
}

/** A platform Assertion → wallet credential. Verified by the platform; public by the assertion endpoint. */
export function fromAssertion(a: {
  entityId: string;
  issuedOn?: string;
  expires?: string;
  revoked?: boolean;
  revocationReason?: string;
  acceptance?: string;
  narrative?: string | null;
  credentialDetails?: Record<string, unknown>;
  course?: Record<string, unknown>;
  program?: Record<string, unknown>;
  metadata?: unknown;
}): WalletCredential {
  const d = (a.credentialDetails ?? {}) as Record<string, unknown>;
  const issuer = (d.issuerDetails ?? d.issuer ?? {}) as Record<string, unknown>;
  const tags = Array.isArray(d.tags) ? (d.tags as unknown[]).map(String) : [];
  const skills = Array.isArray(d.skills)
    ? (d.skills as unknown[])
        .map((s) => (typeof s === "string" ? s : String((s as { name?: string }).name ?? "")))
        .filter(Boolean)
    : [];
  const base = config.dmUrl();
  return {
    id: a.entityId,
    source: "platform",
    kind: ((d.credentialType as string) ?? "").toLowerCase().includes("cert")
      ? "certificate"
      : "badge",
    name: (d.name as string) ?? (d.name_override as string) ?? "Credential",
    description: d.description as string | undefined,
    issuer: {
      name: (issuer.name as string) ?? "ibl.ai",
      url: issuer.url as string | undefined,
      image: issuer.iconImage as string | undefined,
      org: issuer.org as string | undefined,
    },
    issuedOn: a.issuedOn,
    expires: a.expires || undefined,
    image:
      (d.iconImage as string) ?? (d.thumbnailImage as string) ?? (d.image as string) ?? undefined,
    criteria: (d.criteriaNarrative as string) ?? undefined,
    criteriaUrl: (d.criteriaUrl as string) ?? undefined,
    evidence: a.narrative ? [{ name: a.narrative }] : [],
    skills: [...new Set([...skills, ...tags])],
    acceptance:
      a.acceptance?.toLowerCase() === "rejected"
        ? "declined"
        : a.acceptance?.toLowerCase() === "unaccepted"
          ? "pending"
          : "accepted",
    visibility: "public",
    revoked: !!a.revoked,
    revocationReason: a.revocationReason || undefined,
    verification: {
      level: "platform",
      url: `${base}/api/credentials/public/assertions/${a.entityId}/`,
      format: "platform",
    },
    collections: [],
    context: {
      course: (a.course?.name as string) ?? undefined,
      program: (a.program?.name as string) ?? undefined,
    },
    raw: a,
    addedAt: a.issuedOn ?? new Date().toISOString(),
  };
}
