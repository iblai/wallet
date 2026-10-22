"use client";

/**
 * The public wallet page body, used by /p/<username>. Takes a plain snapshot
 * so it renders the same from the demo (read in the browser) and from the
 * server route (signed-in orgs).
 */
import { useMemo } from "react";
import Link from "next/link";
import { MapPin, ShieldCheck } from "lucide-react";
import type { WalletCollection, WalletCredential } from "@/lib/wallet/types";
import { roleById } from "@/lib/wallet/market";
import { CredentialImage } from "@/components/wallet/credential-card";
import { SkillChip, VerificationBadge } from "@/components/wallet/badges";
import { Section } from "@/components/wallet/section";
import { cn } from "@/lib/utils";

export interface PublicSnapshot {
  org: string;
  username: string;
  handle: string;
  profile: { name: string; headline?: string; location?: string; about?: string; image?: string; links?: { label: string; url: string }[] };
  credentials: WalletCredential[];
  skills: string[];
  collections: WalletCollection[];
  targetRoleId?: string;
}

export function PublicWallet({ data, collectionId }: { data: PublicSnapshot; collectionId?: string }) {
  const collection = data.collections.find((c) => c.id === collectionId);
  const credentials = useMemo(() => (collection ? data.credentials.filter((c) => c.collections.includes(collection.id)) : data.credentials), [data.credentials, collection]);
  const skills = useMemo(() => [...new Set(credentials.flatMap((c) => c.skills))], [credentials]);
  const verified = credentials.filter((c) => ["platform", "hosted", "signed"].includes(c.verification.level)).length;
  const role = roleById(data.targetRoleId);
  const initials = data.profile.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto w-full max-w-5xl min-w-0 flex-1 px-4 py-8 md:px-6">
      <div className="flex flex-col items-start gap-5 rounded-lg border border-[var(--border-color,#e5e7eb)] bg-white p-6 sm:flex-row sm:items-center">
        {data.profile.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.profile.image} alt="" className="size-20 rounded-full object-cover" />
        ) : (
          <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-[#0ea5e9] text-2xl font-semibold text-white">{initials}</div>
        )}
        <div className="min-w-0 max-w-full flex-1">
          <h1 className="text-2xl font-semibold text-gray-800">{data.profile.name}</h1>
          {data.profile.headline ? <p className="text-sm text-gray-700">{data.profile.headline}</p> : null}
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {data.profile.location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" /> {data.profile.location}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <ShieldCheck className="size-3.5" /> {verified} of {credentials.length} credentials independently verifiable
            </span>
            {role ? <span>Working toward: {role.title}</span> : null}
          </p>
          {data.profile.links?.length ? (
            <p className="mt-1 flex flex-wrap gap-3 text-xs">
              {data.profile.links.map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="text-[#0058cc] hover:underline">
                  {l.label}
                </a>
              ))}
            </p>
          ) : null}
        </div>
      </div>

      {collection ? (
        <p className="mt-3 rounded-lg bg-[#eef6fc] px-3 py-2 text-xs text-[#0058cc]">
          Showing the collection <strong>{collection.name}</strong>
          {collection.description ? ` — ${collection.description}` : ""}.{" "}
          <Link href={`/p/${encodeURIComponent(data.org)}/${encodeURIComponent(data.username)}`} className="underline">
            See everything public
          </Link>
        </p>
      ) : null}

      {data.profile.about ? (
        <Section className="mt-5" title="About">
          <p className="text-sm text-gray-700">{data.profile.about}</p>
        </Section>
      ) : null}

      <Section className="mt-5" title={`Credentials (${credentials.length})`} description="Click any credential to see its verification.">
        {credentials.length ? (
          <div className="grid gap-3 [&>*]:min-w-0 md:grid-cols-2 xl:grid-cols-3">
            {credentials.map((c) => (
              <Link key={c.id} href={`/verify/${encodeURIComponent(c.id)}?org=${encodeURIComponent(data.org)}&u=${encodeURIComponent(data.username)}`} className={cn("flex min-w-0 gap-3 rounded-xl border border-gray-200 bg-white p-3 hover:border-[#0058cc]/50")}>
                <CredentialImage credential={c} size={56} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.issuer.name}
                    {c.issuedOn ? ` · ${new Date(c.issuedOn).getFullYear()}` : ""}
                  </p>
                  <div className="mt-1.5">
                    <VerificationBadge level={c.verification.level} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No public credentials.</p>
        )}
      </Section>

      {skills.length ? (
        <Section className="mt-5" title={`Skills (${skills.length})`} description="Attested by the credentials above.">
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <SkillChip key={s} name={s} />
            ))}
          </div>
        </Section>
      ) : null}
    </div>
  );
}
