"use client";

import { Suspense, use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  CircleAlert,
  ExternalLink,
  ShieldCheck,
  ShieldQuestion,
  UserCheck,
  XCircle,
} from "lucide-react";
import config from "@/lib/iblai/config";
import { WalletProvider, useWallet } from "@/lib/wallet/provider";
import { credentialStatus, type WalletCredential } from "@/lib/wallet/types";
import { readFragment, type SharedCredential } from "@/lib/wallet/share";
import { checkPublicAssertion } from "@/lib/wallet/public-platform";
import { parseOpenBadge } from "@/lib/wallet/open-badges";
import { CredentialImage } from "@/components/wallet/credential-card";
import { KindBadge, SkillChip, VerificationBadge } from "@/components/wallet/badges";
import { Section } from "@/components/wallet/section";
import { EmptyState } from "@/components/empty-state";
import { LoadingScreen } from "@/components/loading-screen";
import { cn } from "@/lib/utils";

type VerifyStatus =
  | "verified"
  | "revoked"
  | "mismatch"
  | "unreachable"
  | "self-reported"
  | "unverified"
  | "not-found"
  | "expired";

interface VerifyResult {
  status: VerifyStatus;
  method: "platform" | "hosted" | "holder" | "none" | "demo";
  credential?: WalletCredential;
  issuerCopy?: WalletCredential;
  reason?: string;
  checkedAt?: string;
}

/**
 * What an employer sees when they follow a share link — computed entirely in
 * their browser, no server of ours:
 *  - a platform-issued credential is checked live against ibl.ai's public
 *    assertion endpoint (revocation shows the moment the issuer revokes);
 *  - an imported badge is re-fetched from the issuer when the issuer allows
 *    browsers to read it, otherwise the issuer's link is offered;
 *  - the holder's copy of an imported / self-reported record rides in the
 *    link's fragment (`#c=`), labeled with its verification level.
 */
export default function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const decoded = decodeURIComponent(id);
  return (
    <Suspense fallback={<LoadingScreen />}>
      {config.demoMode() ? (
        <WalletProvider>
          <DemoVerify id={decoded} />
        </WalletProvider>
      ) : (
        <LiveVerify id={decoded} />
      )}
    </Suspense>
  );
}

function DemoVerify({ id }: { id: string }) {
  const { state } = useWallet();
  const [checkedAt] = useState(() => new Date().toISOString());
  if (state.isLoading) return <LoadingScreen />;
  const c = state.credentials.find((x) => x.id === id);
  if (!c || c.visibility !== "public")
    return <Verdict result={{ status: "not-found", method: "demo" }} />;
  const status = credentialStatus(c);
  const level = c.verification.level;
  const result: VerifyResult = {
    status:
      status === "revoked"
        ? "revoked"
        : status === "expired"
          ? "expired"
          : level === "self"
            ? "self-reported"
            : level === "unverified"
              ? "unverified"
              : "verified",
    method:
      level === "platform"
        ? "platform"
        : level === "hosted" || level === "signed"
          ? "hosted"
          : "holder",
    credential: c,
    checkedAt,
  };
  return <Verdict result={result} username={state.profile.username} org="demo-wallet" demo />;
}

function fromShared(s: SharedCredential): WalletCredential {
  return {
    ...s,
    acceptance: "accepted",
    visibility: "public",
    collections: [],
    addedAt: s.issuedOn ?? new Date(0).toISOString(),
  };
}

function LiveVerify({ id }: { id: string }) {
  const params = useSearchParams();
  const u = params.get("u") ?? "";
  const org = params.get("org") ?? "";
  const [result, setResult] = useState<VerifyResult | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const holder = readFragment<{ v: 1; holder: string; credential: SharedCredential }>("c");
      const holderCopy = holder?.credential ? fromShared(holder.credential) : undefined;
      const checkedAt = new Date().toISOString();
      const isUrl = /^https?:\/\//i.test(id);

      // 1. Platform-issued: the public assertion endpoint is the authority.
      if (!isUrl) {
        const r = await checkPublicAssertion(id);
        if (cancelled) return;
        if (r.status === "verified") {
          const expired = credentialStatus(r.credential) === "expired";
          setResult({
            status: expired ? "expired" : "verified",
            method: "platform",
            credential: r.credential,
            checkedAt,
          });
        } else if (r.status === "revoked")
          setResult({
            status: "revoked",
            method: "platform",
            reason: r.reason,
            credential: holderCopy,
            checkedAt,
          });
        else if (r.status === "unreachable")
          setResult({
            status: "unreachable",
            method: "platform",
            credential: holderCopy,
            checkedAt,
          });
        else if (holderCopy)
          setResult({
            status: holderCopy.verification.level === "self" ? "self-reported" : "unverified",
            method: "holder",
            credential: holderCopy,
            checkedAt,
          });
        else setResult({ status: "not-found", method: "platform", checkedAt });
        return;
      }

      // 2. Hosted Open Badge: re-fetch from the issuer if its CORS policy allows.
      try {
        const res = await fetch(id, {
          headers: { Accept: "application/ld+json, application/json" },
          cache: "no-store",
        });
        if (res.ok) {
          const live = parseOpenBadge(await res.text(), { sourceUrl: id });
          const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
          const matches =
            !holderCopy ||
            (same(live.name, holderCopy.name) && same(live.issuer.name, holderCopy.issuer.name));
          if (cancelled) return;
          setResult({
            status: live.revoked ? "revoked" : matches ? "verified" : "mismatch",
            method: "hosted",
            credential: holderCopy ?? live,
            issuerCopy: live,
            checkedAt,
          });
          return;
        }
      } catch {
        /* the issuer does not allow browser reads — fall through */
      }
      if (cancelled) return;
      if (holderCopy)
        setResult({
          status: holderCopy.verification.level === "self" ? "self-reported" : "unreachable",
          method: "holder",
          credential: holderCopy,
          checkedAt,
        });
      else setResult({ status: "not-found", method: "none", checkedAt });
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!result) return <LoadingScreen />;
  return <Verdict result={result} username={u} org={org} />;
}

const VERDICT: Record<
  VerifyStatus,
  { title: string; body: string; icon: typeof ShieldCheck; tone: string }
> = {
  verified: {
    title: "Verified",
    body: "The issuer's record confirms this credential.",
    icon: ShieldCheck,
    tone: "border-emerald-200 bg-emerald-50 text-emerald-900",
  },
  revoked: {
    title: "Revoked",
    body: "The issuer has withdrawn this credential. Do not rely on it.",
    icon: XCircle,
    tone: "border-red-200 bg-red-50 text-red-900",
  },
  expired: {
    title: "Expired",
    body: "The issuer set an expiry date that has passed.",
    icon: CircleAlert,
    tone: "border-amber-200 bg-amber-50 text-amber-900",
  },
  mismatch: {
    title: "Does not match",
    body: "The issuer's copy differs from what the holder shows. Treat with caution.",
    icon: CircleAlert,
    tone: "border-red-200 bg-red-50 text-red-900",
  },
  unreachable: {
    title: "Could not reach the issuer",
    body: "The issuer's record could not be read from this browser. Use the issuer's link to confirm; the holder's copy is shown.",
    icon: ShieldQuestion,
    tone: "border-amber-200 bg-amber-50 text-amber-900",
  },
  "self-reported": {
    title: "Self-reported",
    body: "The holder added this record themselves. No issuer has confirmed it.",
    icon: UserCheck,
    tone: "border-amber-200 bg-amber-50 text-amber-900",
  },
  unverified: {
    title: "Not verifiable",
    body: "Imported without a link that can be re-checked.",
    icon: ShieldQuestion,
    tone: "border-gray-200 bg-gray-50 text-gray-800",
  },
  "not-found": {
    title: "Nothing to verify",
    body: "No credential with this id is public, or the link is incomplete.",
    icon: ShieldQuestion,
    tone: "border-gray-200 bg-gray-50 text-gray-800",
  },
};

const METHOD: Record<VerifyResult["method"], string> = {
  platform: "Checked live against ibl.ai's public assertion endpoint, from this browser.",
  hosted: "Checked live against the issuer's hosted Open Badge, from this browser.",
  holder: "From the holder's share link; no issuer check possible.",
  none: "",
  demo: "Demo wallet: verdict derived from the sample data (no issuer was contacted).",
};

const fmt = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

function Verdict({
  result,
  username,
  org,
  demo,
}: {
  result: VerifyResult;
  username?: string;
  org?: string;
  demo?: boolean;
}) {
  const v = VERDICT[result.status];
  const Icon = v.icon;
  const c = result.credential;
  return (
    <div className="mx-auto w-full max-w-5xl min-w-0 flex-1 px-4 py-8 md:px-6">
      <div className={cn("flex items-start gap-3 rounded-lg border p-4", v.tone)}>
        <Icon className="mt-0.5 size-6 shrink-0" />
        <div>
          <h1 className="text-lg font-semibold">{v.title}</h1>
          <p className="text-sm">
            {v.body} {result.reason ? `(${result.reason})` : ""}
          </p>
          <p className="mt-1 text-xs opacity-80">
            {demo ? METHOD.demo : METHOD[result.method]}
            {result.checkedAt ? ` Checked ${new Date(result.checkedAt).toLocaleString()}.` : ""}
          </p>
        </div>
      </div>

      {c ? (
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <Section className="lg:col-span-2">
            <div className="flex flex-col gap-5 sm:flex-row">
              <CredentialImage credential={c} size={128} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-1.5">
                  <KindBadge kind={c.kind} />
                  <VerificationBadge level={c.verification.level} />
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-gray-800">{c.name}</h2>
                <p className="text-sm text-gray-600">
                  Issued by{" "}
                  {c.issuer.url ? (
                    <a
                      href={c.issuer.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-[#0058cc] hover:underline"
                    >
                      {c.issuer.name}
                    </a>
                  ) : (
                    <span className="font-medium">{c.issuer.name}</span>
                  )}
                </p>
                {c.description ? (
                  <p className="mt-3 text-sm text-gray-700">{c.description}</p>
                ) : null}
                <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground text-xs">Issued</dt>
                    <dd className="font-medium text-gray-900">{fmt(c.issuedOn)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">Expires</dt>
                    <dd className="font-medium text-gray-900">
                      {c.expires ? fmt(c.expires) : "Never"}
                    </dd>
                  </div>
                </dl>
                {c.criteria ? (
                  <div className="mt-4">
                    <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                      Earning criteria
                    </p>
                    <p className="text-sm text-gray-700">{c.criteria}</p>
                  </div>
                ) : null}
                {c.skills.length ? (
                  <div className="mt-4">
                    <p className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-wide uppercase">
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {c.skills.map((s) => (
                        <SkillChip key={s} name={s} />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </Section>
          <div className="space-y-5">
            <Section title="Issuer's record">
              {c.verification.url ? (
                <a
                  href={c.verification.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#0058cc] hover:underline"
                >
                  Open at the issuer <ExternalLink className="size-3.5" />
                </a>
              ) : (
                <p className="text-muted-foreground text-sm">
                  The issuer published no public record for this credential.
                </p>
              )}
              {result.issuerCopy && result.status === "mismatch" ? (
                <p className="mt-2 text-xs text-red-700">
                  Issuer says: <strong>{result.issuerCopy.name}</strong> from{" "}
                  {result.issuerCopy.issuer.name}.
                </p>
              ) : null}
            </Section>
            {username && org ? (
              <Section title="Holder">
                <p className="text-sm text-gray-700">
                  <BadgeCheck className="mr-1 inline size-4 text-[#0058cc]" />
                  {username}
                  {demo ? (
                    <>
                      {" · "}
                      <Link
                        href={`/p/${encodeURIComponent(org)}/${encodeURIComponent(username)}`}
                        className="font-medium text-[#0058cc] hover:underline"
                      >
                        public wallet
                      </Link>
                    </>
                  ) : null}
                </p>
              </Section>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <EmptyState
            title="No credential to show"
            description="Ask the holder for a fresh link from their wallet."
          />
        </div>
      )}
    </div>
  );
}
