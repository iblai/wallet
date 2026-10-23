"use client";

import Link from "next/link";
import { Award } from "lucide-react";
import { StatusBadge, VerificationBadge, KIND_LABEL } from "./badges";
import type { WalletCredential } from "@/lib/wallet/types";
import { cn } from "@/lib/utils";

export function CredentialImage({
  credential,
  size = 64,
  className,
}: {
  credential: WalletCredential;
  size?: number;
  className?: string;
}) {
  return credential.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={credential.image}
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0 rounded-xl border border-gray-100 bg-white object-cover", className)}
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#00b0ef]/15 to-[#0058cc]/15 text-[#0058cc]",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Award style={{ width: size * 0.45, height: size * 0.45 }} />
    </div>
  );
}

export function CredentialCard({
  credential,
  href,
  compact,
}: {
  credential: WalletCredential;
  href?: string;
  compact?: boolean;
}) {
  const c = credential;
  const issued = c.issuedOn
    ? new Date(c.issuedOn).toLocaleDateString(undefined, { year: "numeric", month: "short" })
    : undefined;
  const body = (
    <div
      className={cn(
        "flex h-full min-w-0 gap-4 rounded-xl border border-[var(--border-color,#e5e7eb)] bg-white p-4 transition-colors hover:border-[#0058cc]/40",
        compact && "p-3",
      )}
    >
      <CredentialImage credential={c} size={compact ? 48 : 72} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-gray-900">{c.name}</h3>
            <p className="text-muted-foreground truncate text-xs">
              {c.issuer.name}
              {issued ? ` · ${issued}` : ""} · {KIND_LABEL[c.kind]}
            </p>
          </div>
          {c.visibility === "private" ? (
            <span className="rounded-full bg-gray-100 px-2 py-px text-[11px] font-medium text-gray-600">
              Private
            </span>
          ) : null}
        </div>
        <div className="mt-2 flex min-w-0 flex-wrap gap-1.5">
          <VerificationBadge level={c.verification.level} />
          <StatusBadge credential={c} />
        </div>
        {!compact && c.skills.length ? (
          <p className="mt-2 truncate text-xs text-gray-600">
            {c.skills.slice(0, 4).join(" · ")}
            {c.skills.length > 4 ? ` +${c.skills.length - 4}` : ""}
          </p>
        ) : null}
      </div>
    </div>
  );
  return href ? (
    <Link
      href={href}
      className="block h-full min-w-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)]"
    >
      {body}
    </Link>
  ) : (
    body
  );
}
