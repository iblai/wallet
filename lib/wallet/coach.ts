/**
 * The Wallet Coach: answers that come straight from the wallet's own data.
 *
 * When the app is connected to an ibl.ai organization with an agent chosen,
 * the Coach page hands these same facts to the SDK <Chat> as context so the
 * agent can go further (rewrite in a tone, draft a cover letter, role-play
 * an interviewer). Without an agent — demo mode, or an org that has not
 * finished /setup — the Coach still works from these deterministic answers.
 */
import { gapAnalysis, rankRoles, roleById, fmtUsd } from "./market";
import { autoSummary, buildResume, resumeToMarkdown } from "./resume";
import { shareBlurb, verifyLink } from "./share";
import { credentialStatus, daysUntilExpiry, type WalletState } from "./types";
import { walletHealth } from "./health";

export interface CoachPrompt {
  id: string;
  label: string;
  /** Short description shown under the chip. */
  hint: string;
}

function orgFromQuery(q: string): string {
  const m = /[?&]org=([^&]+)/.exec(q);
  return m ? decodeURIComponent(m[1]) : "";
}

export const COACH_PROMPTS: CoachPrompt[] = [
  { id: "status", label: "Where does my wallet stand?", hint: "Health score, what is pending, what expires" },
  { id: "next", label: "What should I earn next?", hint: "Gap analysis for your target role" },
  { id: "summary", label: "Draft my résumé summary", hint: "Two sentences from your record" },
  { id: "resume", label: "Write my résumé", hint: "Full Markdown résumé from the wallet" },
  { id: "send", label: "Which credentials should I send?", hint: "A tailored set for the role" },
  { id: "post", label: "Write a LinkedIn post", hint: "About your latest credential" },
  { id: "roles", label: "Which roles fit me today?", hint: "Roles ranked by evidenced skills" },
  { id: "interview", label: "How do I talk about my credentials?", hint: "One line per credential, STAR-ready" },
];

/** `origin` makes verify links absolute; `verifyQuery` (e.g. `?org=acme&u=jane`) scopes them to the holder. */
export function coachAnswer(promptId: string, state: WalletState, origin = "", verifyQuery = ""): string {
  switch (promptId) {
    case "status":
      return statusAnswer(state);
    case "next":
      return nextAnswer(state);
    case "summary":
      return `Here is a summary you can paste at the top of a résumé or LinkedIn profile:\n\n> ${autoSummary(state)}\n\nEdit it on the Résumé page; the wallet remembers your version.`;
    case "resume":
      return resumeToMarkdown(buildResume(state, origin, orgFromQuery(verifyQuery)));
    case "send":
      return sendAnswer(state, origin, verifyQuery);
    case "post":
      return postAnswer(state, origin, verifyQuery);
    case "roles":
      return rolesAnswer(state);
    case "interview":
      return interviewAnswer(state);
    default:
      return "Pick one of the prompts above.";
  }
}

/** Free-text routing for the chat box: the closest prompt by keyword. */
export function routeQuestion(q: string): string {
  const s = q.toLowerCase();
  if (/(summary|about me|bio)/.test(s)) return "summary";
  if (/(résumé|resume|cv)/.test(s)) return "resume";
  if (/(next|gap|earn|learn|missing)/.test(s)) return "next";
  if (/(send|attach|apply|application)/.test(s)) return "send";
  if (/(post|linkedin|announce|share)/.test(s)) return "post";
  if (/(role|job|fit|career)/.test(s)) return "roles";
  if (/(interview|talk|explain|star)/.test(s)) return "interview";
  return "status";
}

function statusAnswer(state: WalletState): string {
  const h = walletHealth(state);
  const lines = [`**Wallet health: ${h.score}/100.**`];
  const todo = h.checks.filter((c) => !c.done);
  if (!todo.length) lines.push("Every check passes. Keep credentials accepted and current and you are employer-ready.");
  else {
    lines.push("", "What would raise it most:");
    for (const c of todo.sort((a, b) => b.weight - a.weight).slice(0, 4)) lines.push(`- **${c.label}** (+${c.weight}) — ${c.hint}`);
  }
  const pending = state.credentials.filter((c) => credentialStatus(c) === "pending");
  if (pending.length) lines.push("", `**Waiting for you:** ${pending.map((c) => `${c.name} from ${c.issuer.name}`).join("; ")}. Accept them so they count.`);
  const expiring = state.credentials
    .map((c) => ({ c, d: daysUntilExpiry(c) }))
    .filter((x) => x.d !== null && x.d >= 0 && x.d <= 90 && credentialStatus(x.c) === "active");
  if (expiring.length) lines.push("", `**Expiring soon:** ${expiring.map((x) => `${x.c.name} in ${x.d} days`).join("; ")}. Check the issuer's renewal path before it lapses — a lapsed certification drops off most ATS filters.`);
  return lines.join("\n");
}

function nextAnswer(state: WalletState): string {
  const role = roleById(state.settings.targetRoleId);
  if (!role) return "Pick a target role on the Skills page first — the gap analysis needs something to aim at.";
  const g = gapAnalysis(role, state.skills);
  const lines = [`**${role.title}: ${g.coverage}% of the weighted skill set is already evidenced in your wallet.**`, ""];
  if (!g.gaps.length) lines.push("No gaps against this role's skill list. Consider a stretch role — ask \"Which roles fit me today?\"");
  else {
    lines.push("Biggest gaps, most important first:");
    for (const gap of g.gaps.slice(0, 5)) lines.push(`- **${gap.skill}** (${gap.weight === 3 ? "core" : gap.weight === 2 ? "expected" : "nice to have"}) — typically covered by ${gap.suggestions.join(" or ")}`);
    lines.push("", `**Earn next:** ${g.nextCredentials.slice(0, 3).join(", ")}.`);
  }
  if (g.extras.length) lines.push("", `You also bring ${g.extras.slice(0, 5).join(", ")} — not on the role's list, still worth a line on the résumé.`);
  lines.push("", `Market context (illustrative): median ${fmtUsd(role.market.medianSalaryUsd)}, range ${fmtUsd(role.market.salaryRangeUsd[0])}–${fmtUsd(role.market.salaryRangeUsd[1])}, ${role.market.growthPct}% projected growth, demand ${role.market.demand}.`);
  return lines.join("\n");
}

function sendAnswer(state: WalletState, origin: string, verifyQuery = ""): string {
  const role = roleById(state.settings.targetRoleId);
  const active = state.credentials.filter((c) => credentialStatus(c) === "active");
  if (!active.length) return "No active credentials yet. Import or accept one first.";
  const want = new Set((role?.skills ?? []).map((s) => s.name.toLowerCase()));
  const scored = active
    .map((c) => {
      const hits = c.skills.filter((s) => want.has(s.toLowerCase())).length;
      const trust = c.verification.level === "platform" || c.verification.level === "hosted" ? 2 : c.verification.level === "signed" ? 1.5 : c.verification.level === "self" ? 0.5 : 1;
      return { c, score: hits * 2 + trust + (c.kind === "degree" ? 2 : 0) };
    })
    .sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 4);
  const lines = [role ? `For **${role.title}** applications, lead with:` : "Lead with:", ""];
  for (const { c } of top) lines.push(`- **${c.name}** — ${c.issuer.name}${c.skills.length ? ` (${c.skills.slice(0, 3).join(", ")})` : ""}${origin ? ` · verify: ${verifyLink(c, origin, { org: orgFromQuery(verifyQuery), username: state.profile.username })}` : ""}`);
  const rest = scored.slice(4);
  if (rest.length) lines.push("", `Leave the other ${rest.length} on your public wallet page; a recruiter who wants more will look.`);
  const selfOnly = top.filter((t) => t.c.verification.level === "self");
  if (selfOnly.length) lines.push("", "Tip: self-reported items carry less weight than verified ones. If the issuer can send an Open Badge, import it to upgrade the label.");
  return lines.join("\n");
}

function postAnswer(state: WalletState, origin: string, verifyQuery = ""): string {
  const latest = [...state.credentials].filter((c) => credentialStatus(c) === "active").sort((a, b) => (b.issuedOn ?? "").localeCompare(a.issuedOn ?? ""))[0];
  if (!latest) return "Nothing active to announce yet.";
  const url = origin ? verifyLink(latest, origin, { org: orgFromQuery(verifyQuery), username: state.profile.username }) : latest.verification.url ?? "";
  const role = roleById(state.settings.targetRoleId);
  return [
    `Draft post for **${latest.name}**:`,
    "",
    `> ${shareBlurb(latest, url)}`,
    role ? `> One more step toward ${role.title} work. ${latest.skills.length ? `#${latest.skills.slice(0, 3).map((s) => s.replace(/[^A-Za-z0-9]/g, "")).join(" #")}` : ""}` : "",
    "",
    "Use **Share → Add to LinkedIn profile** on the credential page to file it under Licenses & certifications as well — that is what recruiters filter on.",
  ].join("\n");
}

function rolesAnswer(state: WalletState): string {
  const ranked = rankRoles(state.skills).slice(0, 5);
  const lines = ["Roles ranked by how much of their skill set your wallet already evidences:", ""];
  for (const g of ranked) lines.push(`- **${g.role.title}** — ${g.coverage}% · ${g.role.family} · median ${fmtUsd(g.role.market.medianSalaryUsd)} (illustrative)`);
  lines.push("", "Set any of these as your target on the Skills page to see the exact gaps.");
  return lines.join("\n");
}

function interviewAnswer(state: WalletState): string {
  const active = state.credentials.filter((c) => credentialStatus(c) === "active" && c.verification.level !== "self");
  if (!active.length) return "No verified credentials to talk about yet.";
  const lines = ["One sentence per credential — situation, what you did, what it proves:", ""];
  for (const c of active.slice(0, 6)) {
    const did = c.criteria ? c.criteria.replace(/\.$/, "") : `completed ${c.issuer.name}'s requirements`;
    lines.push(`- **${c.name}:** "To earn this, I ${did[0].toLowerCase()}${did.slice(1)}; it shows I can ${c.skills.length ? c.skills.slice(0, 2).map((s) => `apply ${s}`).join(" and ") : "finish what I start"}."`);
  }
  return lines.join("\n");
}
