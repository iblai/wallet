"use client";

import Link from "next/link";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  CheckCircle2,
  Circle,
  Clock,
  Import,
  Sparkles,
  Target,
} from "lucide-react";
import { useWallet } from "@/lib/wallet/provider";
import { walletHealth } from "@/lib/wallet/health";
import { credentialStatus, daysUntilExpiry } from "@/lib/wallet/types";
import { gapAnalysis, roleById } from "@/lib/wallet/market";
import { CredentialCard } from "@/components/wallet/credential-card";
import { Page, Section, StatTile } from "@/components/wallet/section";
import { SkillChip } from "@/components/wallet/badges";
import { EmptyState } from "@/components/empty-state";
import { LoadingScreen } from "@/components/loading-screen";
import { Progress } from "@/components/ui/progress";

/**
 * Home = the wallet at a glance: what needs attention (pending acceptance,
 * expiring), how employer-ready the record is, the latest credentials, and
 * the distance to the target role. Every tile links to the page that fixes it.
 */
export default function WalletHome() {
  const { state } = useWallet();
  if (state.isLoading) return <LoadingScreen />;

  const health = walletHealth(state);
  const pending = state.credentials.filter((c) => credentialStatus(c) === "pending");
  const expiring = state.credentials.filter((c) => {
    const d = daysUntilExpiry(c);
    return d !== null && d >= 0 && d <= 90 && credentialStatus(c) === "active";
  });
  const recent = state.credentials.filter((c) => credentialStatus(c) === "active").slice(0, 4);
  const role = roleById(state.settings.targetRoleId);
  const gap = role ? gapAnalysis(role, state.skills) : null;
  const skillCount = state.skills.filter((s) => s.origin !== "desired").length;
  const firstName = state.profile.name.split(" ")[0];

  if (!state.credentials.length) {
    return (
      <Page>
        <EmptyState
          icon={<Award />}
          title={`Welcome, ${firstName}. Your wallet is empty.`}
          description="Import an Open Badge or Credly badge, connect your ibl.ai organization, or add a record you hold on paper."
          action={
            <Link
              href="/credentials/import"
              className="ibl-button-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
            >
              <Import className="size-4" /> Add your first credential
            </Link>
          }
        />
      </Page>
    );
  }

  return (
    <Page>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-700">Hi {firstName}</h1>
          <p className="text-sm text-gray-600">
            {state.credentials.length} credentials · {health.verifiedCount} verified · {skillCount}{" "}
            skills on record
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/credentials/import"
            className="border-border text-foreground hover:bg-accent inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-2 text-sm font-medium"
          >
            <Import className="size-4" /> Import
          </Link>
          <Link
            href="/coach"
            className="ibl-button-primary inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium"
          >
            <Sparkles className="size-4" /> Ask the Coach
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Wallet health"
          value={`${health.score}`}
          hint="out of 100 · employer-ready score"
          tone={health.score >= 80 ? "good" : "default"}
          href="#health"
        />
        <StatTile
          label="Awaiting acceptance"
          value={pending.length}
          hint={pending.length ? "issuers are waiting on you" : "nothing pending"}
          tone={pending.length ? "warn" : "default"}
          href="/credentials?filter=pending"
        />
        <StatTile
          label="Expiring in 90 days"
          value={expiring.length}
          hint={expiring.length ? expiring[0].name : "all current"}
          tone={expiring.length ? "warn" : "default"}
          href="/credentials?filter=expiring"
        />
        <StatTile
          label={role ? `${role.title} fit` : "Target role"}
          value={gap ? `${gap.coverage}%` : "—"}
          hint={gap ? `${gap.gaps.length} skill gaps` : "choose a role on Skills"}
          href="/skills"
        />
      </div>

      {pending.length ? (
        <Section
          className="mt-5"
          title="Needs your decision"
          description="A credential only counts, and only shows on your page, once you accept it."
        >
          <ul className="divide-y divide-gray-100">
            {pending.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Clock className="size-4 shrink-0 text-blue-600" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{c.name}</p>
                    <p className="text-muted-foreground truncate text-xs">from {c.issuer.name}</p>
                  </div>
                </div>
                <Link
                  href={`/credentials/${encodeURIComponent(c.id)}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#0058cc] hover:underline"
                >
                  Review <ArrowRight className="size-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <div className="mt-5 grid gap-5 lg:grid-cols-3 [&>*]:min-w-0">
        <Section
          className="lg:col-span-2"
          title="Latest credentials"
          actions={
            <Link
              href="/credentials"
              className="text-sm font-medium text-[#0058cc] hover:underline"
            >
              All credentials
            </Link>
          }
        >
          <div className="grid gap-3 xl:grid-cols-2 [&>*]:min-w-0">
            {recent.map((c) => (
              <CredentialCard
                key={c.id}
                credential={c}
                href={`/credentials/${encodeURIComponent(c.id)}`}
              />
            ))}
          </div>
        </Section>

        <Section
          id="health"
          title="Employer-ready checklist"
          description={`${health.score}/100 — what Credly and WGU-style wallets nudge you toward.`}
        >
          <Progress value={health.score} className="mb-4" />
          <ul className="space-y-2">
            {health.checks.map((c) => (
              <li key={c.id} className="flex items-start gap-2 text-sm">
                {c.done ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                ) : (
                  <Circle className="mt-0.5 size-4 shrink-0 text-gray-300" />
                )}
                {c.done ? (
                  <span className="text-gray-600">{c.label}</span>
                ) : (
                  <Link
                    href={c.href}
                    className="text-gray-900 hover:text-[#0058cc] hover:underline"
                  >
                    {c.label} <span className="text-muted-foreground text-xs">+{c.weight}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {role && gap ? (
        <Section
          className="mt-5"
          title={
            <span className="inline-flex items-center gap-2">
              <Target className="size-4 text-[#0058cc]" /> Toward {role.title}
            </span>
          }
          description={`${gap.coverage}% of the weighted skill set evidenced · median ${"$"}${Math.round(role.market.medianSalaryUsd / 1000)}k (illustrative)`}
          actions={
            <Link href="/skills" className="text-sm font-medium text-[#0058cc] hover:underline">
              Full gap analysis
            </Link>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                Evidenced
              </p>
              <div className="flex flex-wrap gap-1.5">
                {gap.matched.map((m) => (
                  <SkillChip key={m.skill} name={m.skill} />
                ))}
                {!gap.matched.length ? (
                  <span className="text-muted-foreground text-sm">Nothing yet.</span>
                ) : null}
              </div>
            </div>
            <div>
              <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                Earn next
              </p>
              <ul className="space-y-1.5 text-sm">
                {gap.gaps.slice(0, 4).map((g) => (
                  <li key={g.skill} className="flex items-center justify-between gap-2">
                    <span className="text-gray-900">{g.skill}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {g.suggestions[0]}
                    </span>
                  </li>
                ))}
                {!gap.gaps.length ? (
                  <li className="inline-flex items-center gap-1.5 text-emerald-700">
                    <BadgeCheck className="size-4" /> No gaps for this role.
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
        </Section>
      ) : null}
    </Page>
  );
}
