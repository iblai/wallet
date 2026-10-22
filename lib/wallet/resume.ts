/**
 * Résumé from the wallet. The wallet already knows the person (profile), what
 * they can do (skills), what proves it (credentials), and where they learned
 * and worked (education, experience). This turns that into a document — the
 * "export my record as a résumé" the WGU Achievement Wallet and LinkedIn's
 * Credly import both promise — as structured sections, Markdown, and plain
 * text. The page renders the sections; the buttons download the text.
 */
import { credentialStatus, type ResumePreferences, type WalletCredential, type WalletState } from "./types";
import { roleById, gapAnalysis } from "./market";
import { verifyLink } from "./share";

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
  const f = (d?: string) => (d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short" }) : "");
  const end = current ? "Present" : f(b);
  return [f(a), end].filter(Boolean).join(" – ");
};

export function featuredCredentials(state: WalletState, prefs: ResumePreferences): WalletCredential[] {
  const ok = state.credentials.filter((c) => credentialStatus(c) === "active");
  const ids = prefs.featuredCredentialIds ?? [];
  const picked = ids.length ? ok.filter((c) => ids.includes(c.id)) : ok;
  return [...picked].sort((a, b) => (b.issuedOn ?? "").localeCompare(a.issuedOn ?? ""));
}

export function buildResume(state: WalletState, origin = "", org = ""): ResumeDoc {
  const prefs = { ...state.settings.resume };
  const sections: ResumeSection[] = [];
  const on = prefs.sections ?? { skills: true, credentials: true, education: true, experience: true };

  const summary = prefs.summary?.trim() || autoSummary(state);
  sections.push({ id: "summary", title: "Summary", items: [{ title: summary }] });

  if (on.skills) {
    const max = prefs.maxSkills ?? 12;
    const skills = state.skills
      .filter((s) => s.origin !== "desired")
      .sort((a, b) => (b.evidence.length + (b.points ?? 0) / 100) - (a.evidence.length + (a.points ?? 0) / 100))
      .slice(0, max)
      .map((s) => s.name);
    if (skills.length) sections.push({ id: "skills", title: "Skills", items: [{ title: "", tags: skills }] });
  }

  if (on.experience && state.experience.length) {
    sections.push({
      id: "experience",
      title: "Experience",
      items: state.experience.map((e) => ({
        title: e.title,
        subtitle: [e.company, e.location].filter(Boolean).join(" · "),
        meta: fmtRange(e.startDate, e.endDate, e.current),
        bullets: e.description ? e.description.split(/\n+/).map((l) => l.replace(/^[-•*]\s*/, "").trim()).filter(Boolean) : [],
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
          meta: [c.issuedOn ? `Issued ${new Date(c.issuedOn).toLocaleDateString(undefined, { year: "numeric", month: "short" })}` : "", c.expires ? `Expires ${new Date(c.expires).toLocaleDateString(undefined, { year: "numeric", month: "short" })}` : "", verificationLabel(c)].filter(Boolean).join(" · "),
          tags: c.skills.slice(0, 5),
          href: origin ? verifyLink(c, origin, { org, username: state.profile.username }) : c.verification.url,
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
    contact: [p.email, p.location, ...(p.links ?? []).map((l) => l.url)].filter(Boolean) as string[],
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
  const verified = active.filter((c) => ["platform", "hosted", "signed"].includes(c.verification.level)).length;
  const topSkills = state.skills
    .filter((s) => s.origin !== "desired")
    .sort((a, b) => b.evidence.length - a.evidence.length)
    .slice(0, 4)
    .map((s) => s.name);
  const latestJob = state.experience[0];
  const who = state.profile.headline || (latestJob ? `${latestJob.title} at ${latestJob.company}` : role ? `${role.title} candidate` : "Professional");
  const proof = active.length
    ? ` Holds ${active.length} credential${active.length === 1 ? "" : "s"}${verified ? ` (${verified} independently verifiable)` : ""}${active[0] ? `, including ${active[0].name} from ${active[0].issuer.name}` : ""}.`
    : "";
  const skills = topSkills.length ? ` Strongest in ${topSkills.join(", ")}.` : "";
  let fit = "";
  if (role) {
    const g = gapAnalysis(role, state.skills);
    fit = ` Targeting ${role.title} roles with ${g.coverage}% of the core skill set already evidenced.`;
  }
  return `${who}.${proof}${skills}${fit}`.replace(/\s+/g, " ").trim();
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
      const head = [it.title && `**${it.title}**`, it.subtitle, it.meta && `_${it.meta}_`].filter(Boolean).join(" — ");
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
