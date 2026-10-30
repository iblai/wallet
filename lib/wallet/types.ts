/**
 * The wallet's own data model.
 *
 * A wallet holds credentials from three origins, normalized to one shape so
 * every page (dashboard, résumé, share, verify) reads the same thing:
 *
 *  - `platform`  — issued on ibl.ai (an Assertion from the credentials API).
 *                  Verified by the platform; the public assertion endpoint
 *                  proves it to anyone with the link.
 *  - `imported`  — an Open Badges 2.0 assertion / 3.0 Verifiable Credential /
 *                  Credly badge the user pasted or fetched. Hosted-verified
 *                  when the issuer's URL still resolves.
 *  - `self`      — a record the user typed in and (optionally) attached a
 *                  file to. Self-attested: shown as such everywhere.
 *
 * Everything the user adds lives on the platform in their per-user metadata
 * (lib/iblai/metadata.ts, namespace `apps.credential-wallet`) — never in a
 * database of our own. Platform assertions are read live and never copied.
 */

export type CredentialSource = "platform" | "imported" | "self";

export type VerificationLevel =
  /** Issued on ibl.ai; provable through the public assertion endpoint. */
  | "platform"
  /** Issuer-hosted assertion/VC whose URL resolves to matching JSON. */
  | "hosted"
  /** Carries a cryptographic proof block (OB3 / VC) we display but do not verify. */
  | "signed"
  /** Imported, but nothing we can re-check. */
  | "unverified"
  /** The user says so. */
  | "self";

export type CredentialStatus = "active" | "pending" | "expired" | "revoked" | "declined";

export type CredentialKind =
  | "badge"
  | "certificate"
  | "degree"
  | "micro-credential"
  | "license"
  | "course"
  | "other";

export interface CredentialIssuer {
  name: string;
  url?: string;
  email?: string;
  image?: string;
  /** The issuing platform's org, on platform credentials. */
  org?: string;
}

export interface CredentialEvidence {
  name: string;
  url?: string;
  description?: string;
}

export interface WalletCredential {
  /** Stable id: the platform entityId, the badge's `id` URL, or a wallet uuid. */
  id: string;
  source: CredentialSource;
  kind: CredentialKind;
  name: string;
  description?: string;
  issuer: CredentialIssuer;
  /** ISO date. */
  issuedOn?: string;
  /** ISO date, when the issuer set one. */
  expires?: string;
  image?: string;
  /** What the earner had to do (Open Badges `criteria.narrative`). */
  criteria?: string;
  criteriaUrl?: string;
  evidence?: CredentialEvidence[];
  /** Skill names the credential attests. */
  skills: string[];
  /** Credly-style acceptance: a credential is "pending" until accepted. */
  acceptance: "accepted" | "pending" | "declined";
  /** Whether the public wallet page lists it. */
  visibility: "public" | "private";
  /** Revoked by the issuer. */
  revoked?: boolean;
  revocationReason?: string;
  verification: {
    level: VerificationLevel;
    /** Where a third party can confirm it. */
    url?: string;
    /** When the wallet last re-checked a hosted credential. */
    checkedAt?: string;
    /** Open Badges / VC spec the import came in as. */
    format?: "ob2" | "ob3" | "credly" | "platform" | "manual";
  };
  /** Collections the user filed it under (ids). */
  collections: string[];
  /** The raw import, kept so it can be re-exported byte-for-byte. */
  raw?: unknown;
  /** Course / program the platform attached it to. */
  context?: { course?: string; program?: string };
  addedAt: string;
}

export interface WalletCollection {
  id: string;
  name: string;
  description?: string;
  /** A collection can be shared on its own link. */
  shared: boolean;
}

export interface WalletSkill {
  name: string;
  /** 1–5 self-rating, when self-reported. */
  level?: number;
  /** Platform skill points, when earned on ibl.ai. */
  points?: number;
  /** Where the wallet learned about it. */
  origin: "credential" | "platform" | "self" | "desired";
  /** Credential ids attesting it. */
  evidence: string[];
}

export interface WalletEducation {
  id: string;
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface WalletExperience {
  id: string;
  company: string;
  title: string;
  employmentType?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface WalletProfile {
  username: string;
  name: string;
  email?: string;
  headline?: string;
  location?: string;
  about?: string;
  image?: string;
  links?: { label: string; url: string }[];
}

/** Everything the user chose; persisted in their platform metadata. */
export interface WalletSettings {
  /** Public handle for /p/<handle>. Empty = no public page. */
  handle?: string;
  publicPageEnabled?: boolean;
  targetRoleId?: string;
  /** Credentials, collections and skills the user added by hand. */
  credentials?: WalletCredential[];
  collections?: WalletCollection[];
  selfSkills?: { name: string; level: number }[];
  desiredSkills?: string[];
  /** Overrides for platform credentials (acceptance / visibility / collections) keyed by id. */
  overrides?: Record<
    string,
    Partial<Pick<WalletCredential, "acceptance" | "visibility" | "collections">>
  >;
  /** Résumé builder choices. */
  resume?: ResumePreferences;
  /** Demo-only education/experience edits (signed-in users edit via the SDK Profile). */
  education?: WalletEducation[];
  experience?: WalletExperience[];
  profile?: Partial<WalletProfile>;
  [key: string]: unknown;
}

export interface ResumePreferences {
  template?: "classic" | "modern" | "compact";
  summary?: string;
  /** Credential ids to feature; empty = all accepted + visible. */
  featuredCredentialIds?: string[];
  sections?: { skills: boolean; credentials: boolean; education: boolean; experience: boolean };
  maxSkills?: number;
}

export interface WalletState {
  profile: WalletProfile;
  credentials: WalletCredential[];
  collections: WalletCollection[];
  skills: WalletSkill[];
  desiredSkills: string[];
  education: WalletEducation[];
  experience: WalletExperience[];
  settings: WalletSettings;
  /** Platform skill points + percentile, when signed in. */
  skillPoints?: { total: number; percentile?: number };
  resumeFileUrl?: string;
  /** Platform keys whose credentials could not be read. */
  unreachablePlatforms?: string[];
  isLoading: boolean;
  isDemo: boolean;
  /** The community organization's read-only sample (`isSampleOrg`). */
  isSample: boolean;
}

export const WALLET_SETTINGS_DEFAULTS: WalletSettings = {
  handle: "",
  publicPageEnabled: false,
  targetRoleId: "",
  credentials: [],
  collections: [],
  selfSkills: [],
  desiredSkills: [],
  overrides: {},
  resume: {
    template: "classic",
    summary: "",
    featuredCredentialIds: [],
    sections: { skills: true, credentials: true, education: true, experience: true },
    maxSkills: 12,
  },
};

export function newId(prefix = "wal"): string {
  const rnd =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}_${rnd}`;
}

export function credentialStatus(c: WalletCredential, now: Date = new Date()): CredentialStatus {
  if (c.revoked) return "revoked";
  if (c.acceptance === "declined") return "declined";
  if (c.expires && new Date(c.expires) < now) return "expired";
  if (c.acceptance === "pending") return "pending";
  return "active";
}

/** Days until expiry (negative when past); null when it never expires. */
export function daysUntilExpiry(c: WalletCredential, now: Date = new Date()): number | null {
  if (!c.expires) return null;
  const ms = new Date(c.expires).getTime() - now.getTime();
  return Math.ceil(ms / 86_400_000);
}
