/**
 * Wallet health: how ready this wallet is to be put in front of an employer.
 * Modeled on what Credly nudges earners toward (accept, make public, share)
 * and what the WGU Achievement Wallet calls a complete record (skills,
 * education, work history, a goal).
 */
import { credentialStatus, daysUntilExpiry, type WalletState } from "./types";

export interface HealthCheck {
  id: string;
  label: string;
  done: boolean;
  /** Points this check is worth. */
  weight: number;
  /** Where to go to fix it. */
  href: string;
  hint: string;
}

export interface WalletHealth {
  score: number;
  checks: HealthCheck[];
  pendingCount: number;
  expiringSoon: number;
  expiredCount: number;
  verifiedCount: number;
  publicCount: number;
}

export function walletHealth(state: WalletState, now: Date = new Date()): WalletHealth {
  const creds = state.credentials;
  const active = creds.filter((c) => credentialStatus(c, now) === "active");
  const pendingCount = creds.filter((c) => credentialStatus(c, now) === "pending").length;
  const expiredCount = creds.filter((c) => credentialStatus(c, now) === "expired").length;
  const expiringSoon = creds.filter((c) => {
    const d = daysUntilExpiry(c, now);
    return d !== null && d >= 0 && d <= 90 && !c.revoked;
  }).length;
  const verifiedCount = creds.filter(
    (c) => ["platform", "hosted", "signed"].includes(c.verification.level) && !c.revoked,
  ).length;
  const publicCount = active.filter((c) => c.visibility === "public").length;

  const checks: HealthCheck[] = [
    {
      id: "credential",
      label: "Hold at least one credential",
      done: creds.length > 0,
      weight: 15,
      href: "/credentials/import",
      hint: "Import an Open Badge, connect ibl.ai, or add a record.",
    },
    {
      id: "verified",
      label: "Have a verified credential",
      done: verifiedCount > 0,
      weight: 15,
      href: "/credentials/import",
      hint: "Platform-issued and issuer-hosted badges verify automatically.",
    },
    {
      id: "accepted",
      label: "No credentials waiting for acceptance",
      done: pendingCount === 0,
      weight: 10,
      href: "/credentials?filter=pending",
      hint: "Accept or decline what issuers sent you.",
    },
    {
      id: "skills",
      label: "Five or more skills on record",
      done: state.skills.filter((s) => s.origin !== "desired").length >= 5,
      weight: 10,
      href: "/skills",
      hint: "Skills come from credentials; add the ones you can show.",
    },
    {
      id: "role",
      label: "A target role chosen",
      done: !!state.settings.targetRoleId,
      weight: 10,
      href: "/skills",
      hint: "Pick a role to see the skill gap and what to earn next.",
    },
    {
      id: "experience",
      label: "Work experience listed",
      done: state.experience.length > 0,
      weight: 10,
      href: "/profile",
      hint: "Employers read experience next to credentials.",
    },
    {
      id: "education",
      label: "Education listed",
      done: state.education.length > 0,
      weight: 10,
      href: "/profile",
      hint: "Degrees and programs anchor the record.",
    },
    {
      id: "resume",
      label: "Résumé generated",
      done: !!state.settings.resume?.summary || !!state.resumeFileUrl,
      weight: 10,
      href: "/resume",
      hint: "Build one from the wallet in a minute.",
    },
    {
      id: "public",
      label: "Public wallet page on",
      done: !!state.settings.publicPageEnabled && !!state.settings.handle,
      weight: 5,
      href: "/share",
      hint: "One link that proves everything on it.",
    },
    {
      id: "shared",
      label: "At least one credential public",
      done: publicCount > 0,
      weight: 5,
      href: "/credentials",
      hint: "Private credentials never appear on your page.",
    },
  ];
  const score = checks.reduce((n, c) => n + (c.done ? c.weight : 0), 0);
  return { score, checks, pendingCount, expiringSoon, expiredCount, verifiedCount, publicCount };
}
