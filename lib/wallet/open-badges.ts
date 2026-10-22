/**
 * Open Badges in, Open Badges out.
 *
 * Import: an Open Badges 2.0 Assertion (what Credly, Badgr, Canvas Credentials
 * and most LMSs publish at a badge's JSON URL), an Open Badges 3.0 /
 * W3C Verifiable Credential (`OpenBadgeCredential`, what WGU's Achievement
 * Wallet and newer issuers hand out), or a Credly badge-page URL. All become
 * one `WalletCredential`.
 *
 * Export: every wallet credential can leave again as an unsigned Open Badges
 * 3.0 credential (the Learning and Employment Record shape employers' ATSs
 * and other wallets read), or the original JSON byte-for-byte.
 */
import {
  newId,
  type CredentialEvidence,
  type CredentialKind,
  type WalletCredential,
} from "./types";

type J = Record<string, unknown>;

const isObj = (v: unknown): v is J => !!v && typeof v === "object" && !Array.isArray(v);
const str = (v: unknown): string | undefined => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : v === undefined || v === null ? [] : [v]);
const types = (v: unknown): string[] => arr(v).map((t) => String(t));

export class OpenBadgeParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenBadgeParseError";
  }
}

/** What `detectFormat` recognizes. */
export type BadgeFormat = "ob2" | "ob3" | "credly";

export function detectFormat(doc: J): BadgeFormat | null {
  const t = types(doc.type);
  if (t.includes("OpenBadgeCredential") || t.includes("AchievementCredential") || t.includes("VerifiableCredential"))
    return "ob3";
  if (t.includes("Assertion") || (isObj(doc.badge) || typeof doc.badge === "string") && doc.recipient) return "ob2";
  if (doc.badge_template || doc.issued_to || (doc.state && doc.badge_template_id)) return "credly";
  return null;
}

/** Parse whatever the user pasted: JSON text, or an object already. */
export function parseOpenBadge(input: string | J, opts: { sourceUrl?: string } = {}): WalletCredential {
  let doc: J;
  if (typeof input === "string") {
    try {
      doc = JSON.parse(input) as J;
    } catch {
      throw new OpenBadgeParseError("That is not valid JSON. Paste the badge's JSON (Open Badges 2.0 or 3.0).");
    }
  } else doc = input;
  if (!isObj(doc)) throw new OpenBadgeParseError("Expected a JSON object.");

  const format = detectFormat(doc);
  switch (format) {
    case "ob3":
      return fromOb3(doc, opts);
    case "ob2":
      return fromOb2(doc, opts);
    case "credly":
      return fromCredly(doc, opts);
    default:
      throw new OpenBadgeParseError(
        "Could not recognize this as an Open Badges 2.0 assertion, an Open Badges 3.0 credential, or a Credly badge.",
      );
  }
}

// ---------- Open Badges 2.0 ----------

function fromOb2(doc: J, opts: { sourceUrl?: string }): WalletCredential {
  const badge = isObj(doc.badge) ? doc.badge : {};
  const issuer = isObj(badge.issuer) ? badge.issuer : {};
  const criteria = isObj(badge.criteria) ? badge.criteria : {};
  const verification = isObj(doc.verification) ? doc.verification : {};
  const alignment = arr(badge.alignment).filter(isObj);
  const tags = arr(badge.tags).map(String);

  const name = str(badge.name);
  if (!name) throw new OpenBadgeParseError("The assertion's `badge.name` is missing — paste the full assertion, not just the BadgeClass id.");

  const id = str(doc.id) ?? opts.sourceUrl ?? newId("ob2");
  const hosted = str(verification.type) === "hosted" || types(verification.type).includes("HostedBadge");
  const signed = str(verification.type) === "signed" || types(verification.type).includes("SignedBadge");

  return {
    id,
    source: "imported",
    kind: guessKind(name, tags),
    name,
    description: str(badge.description),
    issuer: {
      name: str(issuer.name) ?? "Unknown issuer",
      url: str(issuer.url),
      email: str(issuer.email),
      image: imageOf(issuer.image),
    },
    issuedOn: isoDate(doc.issuedOn),
    expires: isoDate(doc.expires),
    image: imageOf(doc.image) ?? imageOf(badge.image),
    criteria: str(criteria.narrative),
    criteriaUrl: str(criteria.id) ?? (typeof badge.criteria === "string" ? badge.criteria : undefined),
    evidence: evidenceOf(doc.evidence),
    skills: uniq([...alignment.map((a) => str(a.targetName)).filter(Boolean), ...tags] as string[]),
    acceptance: "pending",
    visibility: "private",
    revoked: doc.revoked === true,
    revocationReason: str(doc.revocationReason),
    verification: {
      level: hosted && /^https?:\/\//.test(id) ? "hosted" : signed ? "signed" : "unverified",
      url: hosted && /^https?:\/\//.test(id) ? id : opts.sourceUrl,
      format: "ob2",
    },
    collections: [],
    raw: doc,
    addedAt: new Date().toISOString(),
  };
}

// ---------- Open Badges 3.0 / Verifiable Credentials ----------

function fromOb3(doc: J, opts: { sourceUrl?: string }): WalletCredential {
  const subject = isObj(doc.credentialSubject) ? doc.credentialSubject : {};
  const achievement = isObj(subject.achievement) ? subject.achievement : {};
  const issuer = isObj(doc.issuer) ? doc.issuer : typeof doc.issuer === "string" ? { id: doc.issuer } : {};
  const criteria = isObj(achievement.criteria) ? achievement.criteria : {};
  const alignment = arr(achievement.alignment).filter(isObj);
  const tags = arr(achievement.tag).map(String);
  const proof = arr(doc.proof).filter(isObj);

  const name = str(achievement.name) ?? str(doc.name);
  if (!name) throw new OpenBadgeParseError("The credential's `credentialSubject.achievement.name` is missing.");

  const id = str(doc.id) ?? opts.sourceUrl ?? newId("ob3");
  const achievementType = str(achievement.achievementType);

  return {
    id,
    source: "imported",
    kind: kindFromAchievementType(achievementType) ?? guessKind(name, tags),
    name,
    description: str(achievement.description) ?? str(doc.description),
    issuer: {
      name: str(issuer.name) ?? "Unknown issuer",
      url: str(issuer.url) ?? (str(issuer.id)?.startsWith("http") ? str(issuer.id) : undefined),
      email: str(issuer.email),
      image: imageOf(issuer.image),
    },
    issuedOn: isoDate(doc.validFrom) ?? isoDate(doc.issuanceDate) ?? isoDate(doc.awardedDate),
    expires: isoDate(doc.validUntil) ?? isoDate(doc.expirationDate),
    image: imageOf(achievement.image) ?? imageOf(doc.image),
    criteria: str(criteria.narrative),
    criteriaUrl: str(criteria.id),
    evidence: evidenceOf(doc.evidence),
    skills: uniq([...alignment.map((a) => str(a.targetName)).filter(Boolean), ...tags] as string[]),
    acceptance: "pending",
    visibility: "private",
    verification: {
      level: proof.length ? "signed" : /^https?:\/\//.test(id) ? "hosted" : "unverified",
      url: /^https?:\/\//.test(id) ? id : opts.sourceUrl,
      format: "ob3",
    },
    collections: [],
    raw: doc,
    addedAt: new Date().toISOString(),
  };
}

// ---------- Credly ----------

/**
 * Credly's badge JSON (`https://www.credly.com/badges/<id>.json` or the
 * "Download JSON" of a badge) nests the template and issuer. Credly also
 * serves a proper Open Badges 2.0 assertion at `…/badges/<id>/json` — that
 * path goes through `fromOb2`.
 */
function fromCredly(doc: J, opts: { sourceUrl?: string }): WalletCredential {
  const tpl = isObj(doc.badge_template) ? doc.badge_template : {};
  const issuerEntity = isObj(doc.issuer) ? (isObj(doc.issuer.entities) ? doc.issuer : doc.issuer) : {};
  const entities = arr((issuerEntity as J).entities).filter(isObj);
  const org = isObj(tpl.issuer) ? tpl.issuer : entities.length && isObj(entities[0].entity) ? entities[0].entity : {};
  const skills = arr(tpl.skills).map((s) => (isObj(s) ? str(s.name) : str(s))).filter(Boolean) as string[];
  const name = str(tpl.name);
  if (!name) throw new OpenBadgeParseError("Credly badge JSON without a `badge_template.name`.");
  const id = str(doc.badge_url) ?? (str(doc.id) ? `https://www.credly.com/badges/${doc.id}` : undefined) ?? opts.sourceUrl ?? newId("credly");

  return {
    id,
    source: "imported",
    kind: guessKind(name, [str(tpl.type_category) ?? ""]),
    name,
    description: str(tpl.description),
    issuer: { name: str(org.name) ?? "Credly issuer", url: str(org.url) ?? str(org.vanity_url), image: str(org.image_url) },
    issuedOn: isoDate(doc.issued_at),
    expires: isoDate(doc.expires_at),
    image: str(doc.image_url) ?? str(tpl.image_url),
    criteria: str(tpl.criteria_narrative) ?? str(tpl.criteria),
    criteriaUrl: str(tpl.criteria_url),
    evidence: evidenceOf(doc.evidence),
    skills,
    acceptance: str(doc.state) === "accepted" ? "accepted" : "pending",
    visibility: "private",
    revoked: str(doc.state) === "revoked",
    verification: { level: "hosted", url: id.startsWith("http") ? id : undefined, format: "credly" },
    collections: [],
    raw: doc,
    addedAt: new Date().toISOString(),
  };
}

// ---------- export ----------

/**
 * An (unsigned) Open Badges 3.0 `OpenBadgeCredential`. Platform-issued
 * credentials point their `id` at ibl.ai's public assertion endpoint so a
 * reader can still verify them; imported ones re-export their original JSON
 * instead (see `exportOriginal`).
 */
export function toOpenBadge3(c: WalletCredential, holder: { name: string; email?: string; url?: string }): J {
  return {
    "@context": [
      "https://www.w3.org/ns/credentials/v2",
      "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json",
    ],
    id: c.verification.url ?? c.id,
    type: ["VerifiableCredential", "OpenBadgeCredential"],
    name: c.name,
    description: c.description,
    issuer: {
      id: c.issuer.url ?? `urn:issuer:${slug(c.issuer.name)}`,
      type: ["Profile"],
      name: c.issuer.name,
      url: c.issuer.url,
      email: c.issuer.email,
      image: c.issuer.image ? { id: c.issuer.image, type: "Image" } : undefined,
    },
    validFrom: c.issuedOn,
    validUntil: c.expires,
    credentialSubject: {
      type: ["AchievementSubject"],
      identifier: holder.email
        ? [{ type: "IdentityObject", identityHash: holder.email, identityType: "emailAddress", hashed: false }]
        : undefined,
      achievement: {
        id: c.verification.url ?? c.id,
        type: ["Achievement"],
        achievementType: achievementTypeOf(c.kind),
        name: c.name,
        description: c.description ?? c.name,
        criteria: { id: c.criteriaUrl, narrative: c.criteria ?? "See issuer." },
        image: c.image ? { id: c.image, type: "Image" } : undefined,
        alignment: c.skills.map((s) => ({ type: ["Alignment"], targetName: s, targetUrl: `urn:skill:${slug(s)}` })),
        tag: c.skills,
      },
      narrative: c.evidence?.map((e) => e.name).join("; ") || undefined,
    },
    evidence: c.evidence?.length
      ? c.evidence.map((e) => ({ type: ["Evidence"], id: e.url, name: e.name, description: e.description }))
      : undefined,
    // No `proof`: the wallet re-packages, it does not sign. Verification lives at `id`.
    "ibl:verification": { level: c.verification.level, source: c.source, holder: holder.name },
  };
}

export function exportOriginal(c: WalletCredential): J | null {
  return isObj(c.raw) ? c.raw : null;
}

/** The whole wallet as one LER-style bundle (a VerifiablePresentation without proof). */
export function toWalletBundle(
  credentials: WalletCredential[],
  holder: { name: string; email?: string; url?: string },
): J {
  return {
    "@context": ["https://www.w3.org/ns/credentials/v2"],
    type: ["VerifiablePresentation"],
    holder: { name: holder.name, email: holder.email, url: holder.url },
    verifiableCredential: credentials.map((c) => exportOriginal(c) ?? toOpenBadge3(c, holder)),
    generatedAt: new Date().toISOString(),
    generator: "ibl.ai Credential Wallet",
  };
}

// ---------- helpers ----------

function imageOf(v: unknown): string | undefined {
  if (typeof v === "string") return v;
  if (isObj(v)) return str(v.id) ?? str(v.url);
  return undefined;
}

function isoDate(v: unknown): string | undefined {
  const s = str(v);
  if (!s) return undefined;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

function evidenceOf(v: unknown): CredentialEvidence[] {
  return arr(v)
    .map((e) => {
      if (typeof e === "string") return { name: e, url: e };
      if (isObj(e)) return { name: str(e.name) ?? str(e.id) ?? "Evidence", url: str(e.id) ?? str(e.url), description: str(e.description) ?? str(e.narrative) };
      return null;
    })
    .filter(Boolean) as CredentialEvidence[];
}

function uniq(xs: string[]): string[] {
  const seen = new Set<string>();
  return xs.filter((x) => {
    const k = x.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function guessKind(name: string, tags: string[] = []): CredentialKind {
  const hay = `${name} ${tags.join(" ")}`.toLowerCase();
  if (/\b(bachelor|master|associate|doctor|phd|b\.?s\.?|m\.?s\.?|mba|degree)\b/.test(hay)) return "degree";
  if (/\b(license|licence|licensed)\b/.test(hay)) return "license";
  if (/\b(micro-?credential|nanodegree|specialization)\b/.test(hay)) return "micro-credential";
  if (/\b(certificate|certified|certification)\b/.test(hay)) return "certificate";
  if (/\b(course|completion)\b/.test(hay)) return "course";
  if (/\bbadge\b/.test(hay)) return "badge";
  return "badge";
}

function kindFromAchievementType(t?: string): CredentialKind | undefined {
  switch (t) {
    case "Badge":
      return "badge";
    case "Certificate":
    case "Certification":
    case "CertificateOfCompletion":
      return "certificate";
    case "Degree":
    case "AssociateDegree":
    case "BachelorDegree":
    case "MasterDegree":
    case "DoctoralDegree":
    case "Diploma":
      return "degree";
    case "MicroCredential":
      return "micro-credential";
    case "License":
      return "license";
    case "Course":
    case "Learning Certificate":
      return "course";
    default:
      return undefined;
  }
}

function achievementTypeOf(k: CredentialKind): string {
  return (
    { badge: "Badge", certificate: "Certificate", degree: "Degree", "micro-credential": "MicroCredential", license: "License", course: "Course", other: "Achievement" } as const
  )[k];
}

/** Turn a Credly badge page URL into its JSON URL(s) to try, in order. */
export function credlyJsonCandidates(url: string): string[] {
  const m = /^https?:\/\/(?:www\.)?credly\.com\/badges\/([a-z0-9-]+)/i.exec(url.trim());
  if (!m) return [];
  const id = m[1];
  return [`https://www.credly.com/badges/${id}/json`, `https://www.credly.com/badges/${id}.json`];
}
