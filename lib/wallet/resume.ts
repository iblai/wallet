/**
 * Résumé from the wallet. The wallet already knows the person (profile), what
 * they can do (skills), what proves it (credentials), and where they learned
 * and worked (education, experience). This turns that into a document — the
 * "export my record as a résumé" the WGU Achievement Wallet and LinkedIn's
 * Credly import both promise — as structured sections, Markdown, and plain
 * text. The page renders the sections; the buttons download the text.
 */
import {
  credentialStatus,
  type ResumePreferences,
  type WalletCredential,
  type WalletState,
} from "./types";
import { roleById, gapAnalysis } from "./market";
import { verifyLink } from "./share";
import type { ChatMessage } from "../iblai/completions";

export interface ResumeSection {
  id: "summary" | "skills" | "credentials" | "experience" | "education";
  title: string;
  items: ResumeItem[];
}

export interface ResumeItem {
  title: string;
  subtitle?: string;
  meta?: string;
  bullets?: string[];
  tags?: string[];
  /** A verify link, for credentials. */
  href?: string;
}

export interface ResumeDoc {
  name: string;
  headline?: string;
  contact: string[];
  sections: ResumeSection[];
}

const fmtRange = (a?: string, b?: string, current?: boolean) => {
  const f = (d?: string) =>
    d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short" }) : "";
  const end = current ? "Present" : f(b);
  return [f(a), end].filter(Boolean).join(" – ");
};

export function featuredCredentials(
  state: WalletState,
  prefs: ResumePreferences,
): WalletCredential[] {
  const ok = state.credentials.filter((c) => credentialStatus(c) === "active");
  const ids = prefs.featuredCredentialIds ?? [];
  const picked = ids.length ? ok.filter((c) => ids.includes(c.id)) : ok;
  return [...picked].sort((a, b) => (b.issuedOn ?? "").localeCompare(a.issuedOn ?? ""));
}

export function buildResume(state: WalletState, origin = "", org = ""): ResumeDoc {
  const prefs = { ...state.settings.resume };
  const sections: ResumeSection[] = [];
  const on = prefs.sections ?? {
    skills: true,
    credentials: true,
    education: true,
    experience: true,
  };

  const summary = prefs.summary?.trim() || autoSummary(state);
  if (summary) sections.push({ id: "summary", title: "Summary", items: [{ title: summary }] });

  if (on.skills) {
    const max = prefs.maxSkills ?? 12;
    const skills = state.skills
      .filter((s) => s.origin !== "desired")
      .sort(
        (a, b) =>
          b.evidence.length + (b.points ?? 0) / 100 - (a.evidence.length + (a.points ?? 0) / 100),
      )
      .slice(0, max)
      .map((s) => s.name);
    if (skills.length)
      sections.push({ id: "skills", title: "Skills", items: [{ title: "", tags: skills }] });
  }

  if (on.experience && state.experience.length) {
    sections.push({
      id: "experience",
      title: "Experience",
      items: state.experience.map((e) => ({
        title: e.title,
        subtitle: [e.company, e.location].filter(Boolean).join(" · "),
        meta: fmtRange(e.startDate, e.endDate, e.current),
        bullets: e.description
          ? e.description
              .split(/\n+/)
              .map((l) => l.replace(/^[-•*]\s*/, "").trim())
              .filter(Boolean)
          : [],
      })),
    });
  }

  if (on.credentials) {
    const creds = featuredCredentials(state, prefs);
    if (creds.length)
      sections.push({
        id: "credentials",
        title: "Licenses & Certifications",
        items: creds.map((c) => ({
          title: c.name,
          subtitle: c.issuer.name,
          meta: [
            c.issuedOn
              ? `Issued ${new Date(c.issuedOn).toLocaleDateString(undefined, { year: "numeric", month: "short" })}`
              : "",
            c.expires
              ? `Expires ${new Date(c.expires).toLocaleDateString(undefined, { year: "numeric", month: "short" })}`
              : "",
            verificationLabel(c),
          ]
            .filter(Boolean)
            .join(" · "),
          tags: c.skills.slice(0, 5),
          href: origin
            ? verifyLink(c, origin, { org, username: state.profile.username })
            : c.verification.url,
        })),
      });
  }

  if (on.education && state.education.length) {
    sections.push({
      id: "education",
      title: "Education",
      items: state.education.map((e) => ({
        title: [e.degree, e.fieldOfStudy].filter(Boolean).join(", ") || e.institution,
        subtitle: e.degree || e.fieldOfStudy ? e.institution : undefined,
        meta: fmtRange(e.startDate, e.endDate, e.current),
        bullets: e.description ? [e.description] : [],
      })),
    });
  }

  const p = state.profile;
  return {
    name: p.name,
    headline: p.headline,
    contact: [p.email, p.location, ...(p.links ?? []).map((l) => l.url)].filter(
      Boolean,
    ) as string[],
    sections,
  };
}

export function verificationLabel(c: WalletCredential): string {
  switch (c.verification.level) {
    case "platform":
      return "Verified on ibl.ai";
    case "hosted":
      return "Issuer-verified";
    case "signed":
      return "Digitally signed";
    case "self":
      return "Self-reported";
    default:
      return "Unverified";
  }
}

/** A two-sentence summary from what the wallet knows; the user can overwrite it. */
export function autoSummary(state: WalletState): string {
  const role = roleById(state.settings.targetRoleId);
  const active = state.credentials.filter((c) => credentialStatus(c) === "active");
  const verified = active.filter((c) =>
    ["platform", "hosted", "signed"].includes(c.verification.level),
  ).length;
  const topSkills = topSkillNames(state, 4);
  const latestJob = state.experience[0];
  const who =
    state.profile.headline ||
    (latestJob
      ? `${latestJob.title} at ${latestJob.company}`
      : role
        ? `${role.title} candidate`
        : "");
  const proof = active.length
    ? ` Holds ${active.length} credential${active.length === 1 ? "" : "s"}${verified ? ` (${verified} independently verifiable)` : ""}${active[0] ? `, including ${active[0].name} from ${active[0].issuer.name}` : ""}.`
    : "";
  const skills = topSkills.length ? ` Strongest in ${topSkills.join(", ")}.` : "";
  let fit = "";
  if (role) {
    const g = gapAnalysis(role, state.skills);
    fit = ` Targeting ${role.title} roles with ${g.coverage}% of the core skill set already evidenced.`;
  }
  return `${who && `${who}.`}${proof}${skills}${fit}`.replace(/\s+/g, " ").trim();
}

/**
 * The facts "Draft for me" sends to the platform's AI. A thin record (a new
 * user) asks for an editable opener with [bracketed] prompts, never a note
 * that facts are missing.
 */
export function summaryPrompt(state: WalletState): ChatMessage[] {
  const role = roleById(state.settings.targetRoleId);
  const skills = topSkillNames(state, 8);
  const active = state.credentials.filter((c) => credentialStatus(c) === "active");
  const pending = state.credentials.filter((c) => credentialStatus(c) === "pending");
  const p = state.profile;
  const facts = [
    `Name: ${p.name}`,
    p.headline ? `Headline: ${p.headline}` : "",
    p.about ? `About: ${p.about}` : "",
    p.location ? `Location: ${p.location}` : "",
    ...state.experience
      .slice(0, 3)
      .map((e) => `Role: ${e.title} at ${e.company}${e.current ? " (current)" : ""}`),
    ...state.education
      .slice(0, 2)
      .map(
        (e) =>
          `Education: ${[e.degree, e.fieldOfStudy].filter(Boolean).join(", ") || "Studies"} at ${e.institution}`,
      ),
    ...active
      .slice(0, 8)
      .map((c) => `Credential: ${c.name} from ${c.issuer.name} (${verificationLabel(c)})`),
    ...pending
      .slice(0, 3)
      .map((c) => `Credential (awaiting acceptance): ${c.name} from ${c.issuer.name}`),
    skills.length ? `Skills: ${skills.join(", ")}` : "",
    state.desiredSkills.length ? `Learning: ${state.desiredSkills.slice(0, 6).join(", ")}` : "",
    role ? `Target role: ${role.title}` : "",
  ].filter(Boolean);
  const thin =
    !state.experience.length &&
    !state.education.length &&
    !active.length &&
    !pending.length &&
    !skills.length;
  return [
    {
      role: "system",
      content:
        "You write the summary section of a résumé: two or three sentences of plain text in the impersonal résumé voice (no I, my, he or she), with no headings, lists or field labels. Use only the facts given; never invent an employer, title, school, date, number or credential, and infer nothing from the person's name. When the record is thin, write what the facts support as prose, then end with one square-bracket prompt telling the person what to add, such as [Add your target role, years of experience and the two skills you want to lead with]. Never say that the record is empty or that facts are missing.",
    },
    {
      role: "user",
      content: [
        "Write the summary for this person.",
        "",
        ...facts,
        ...(thin ? ["", THIN_RECORD] : []),
      ].join("\n"),
    },
  ];
}

const THIN_RECORD =
  "This record is new: no work history, education or credential yet. Write an opening summary the person can edit: one or two plain sentences on the direction they are heading and the skills they are building where the facts give them, then one square-bracket prompt naming what to add.";

function topSkillNames(state: WalletState, n: number): string[] {
  return state.skills
    .filter((s) => s.origin !== "desired")
    .sort((a, b) => b.evidence.length - a.evidence.length)
    .slice(0, n)
    .map((s) => s.name);
}

export function resumeToMarkdown(doc: ResumeDoc): string {
  const out: string[] = [`# ${doc.name}`];
  if (doc.headline) out.push(`**${doc.headline}**`);
  if (doc.contact.length) out.push(doc.contact.join(" · "));
  for (const s of doc.sections) {
    out.push("", `## ${s.title}`);
    for (const it of s.items) {
      if (it.tags && !it.title) {
        out.push(it.tags.join(" · "));
        continue;
      }
      if (s.id === "summary") {
        out.push(it.title);
        continue;
      }
      const head = [it.title && `**${it.title}**`, it.subtitle, it.meta && `_${it.meta}_`]
        .filter(Boolean)
        .join(" — ");
      out.push(`- ${it.href ? `${head} ([verify](${it.href}))` : head}`);
      for (const b of it.bullets ?? []) out.push(`  - ${b}`);
      if (it.tags?.length && it.title) out.push(`  - Skills: ${it.tags.join(", ")}`);
    }
  }
  return out.join("\n");
}

export function resumeToText(doc: ResumeDoc): string {
  return resumeToMarkdown(doc)
    .replace(/^## (.*)$/gm, (_m, t: string) => t.toUpperCase())
    .replace(/^# /gm, "")
    .replace(/\*\*|_/g, "")
    .replace(/\(\[verify\]\((.*?)\)\)/g, "(verify: $1)");
}
