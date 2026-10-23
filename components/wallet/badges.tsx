"use client";

import {
  BadgeCheck,
  CircleAlert,
  Clock,
  FileCheck,
  ShieldCheck,
  ShieldQuestion,
  UserCheck,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  credentialStatus,
  daysUntilExpiry,
  type CredentialStatus,
  type VerificationLevel,
  type WalletCredential,
} from "@/lib/wallet/types";
import { cn } from "@/lib/utils";

const VERIFICATION: Record<
  VerificationLevel,
  { label: string; hint: string; icon: typeof ShieldCheck; className: string }
> = {
  platform: {
    label: "Verified on ibl.ai",
    hint: "Issued on the platform. Anyone with the link can confirm it against the issuer's record.",
    icon: ShieldCheck,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  hosted: {
    label: "Issuer-verified",
    hint: "The issuer hosts this badge at a public URL the wallet can re-check.",
    icon: BadgeCheck,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  signed: {
    label: "Digitally signed",
    hint: "Carries an Open Badges 3.0 proof. The wallet shows the proof; it does not validate the signature.",
    icon: FileCheck,
    className: "bg-sky-50 text-sky-700 border-sky-200",
  },
  unverified: {
    label: "Unverified",
    hint: "Imported, but nothing the wallet can re-check.",
    icon: ShieldQuestion,
    className: "bg-gray-50 text-gray-600 border-gray-200",
  },
  self: {
    label: "Self-reported",
    hint: "Added by you. Employers see it labeled this way.",
    icon: UserCheck,
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
};

export function VerificationBadge({
  level,
  className,
}: {
  level: VerificationLevel;
  className?: string;
}) {
  const v = VERIFICATION[level];
  const Icon = v.icon;
  return (
    <Tooltip>
      <TooltipTrigger render={<span />}>
        <Badge
          variant="outline"
          className={cn("max-w-full gap-1 font-medium", v.className, className)}
        >
          <Icon /> <span className="truncate">{v.label}</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{v.hint}</TooltipContent>
    </Tooltip>
  );
}

const STATUS: Record<CredentialStatus, { label: string; icon: typeof Clock; className: string }> = {
  active: {
    label: "Active",
    icon: BadgeCheck,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  pending: {
    label: "Awaiting acceptance",
    icon: Clock,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  expired: {
    label: "Expired",
    icon: CircleAlert,
    className: "bg-red-50 text-red-700 border-red-200",
  },
  revoked: { label: "Revoked", icon: XCircle, className: "bg-red-50 text-red-700 border-red-200" },
  declined: {
    label: "Declined",
    icon: XCircle,
    className: "bg-gray-50 text-gray-600 border-gray-200",
  },
};

export function StatusBadge({
  credential,
  className,
}: {
  credential: WalletCredential;
  className?: string;
}) {
  const status = credentialStatus(credential);
  const days = daysUntilExpiry(credential);
  const expiring = status === "active" && days !== null && days <= 90;
  const s = STATUS[status];
  const Icon = expiring ? Clock : s.icon;
  return (
    <Badge
      variant="outline"
      className={cn(
        "max-w-full gap-1 font-medium",
        expiring ? "bg-amber-50 text-amber-800 border-amber-200" : s.className,
        className,
      )}
    >
      <Icon />{" "}
      <span className="truncate">
        {expiring ? `Expires in ${days} day${days === 1 ? "" : "s"}` : s.label}
      </span>
    </Badge>
  );
}

export const KIND_LABEL: Record<WalletCredential["kind"], string> = {
  badge: "Badge",
  certificate: "Certificate",
  degree: "Degree",
  "micro-credential": "Micro-credential",
  license: "License",
  course: "Course",
  other: "Credential",
};

export function KindBadge({ kind }: { kind: WalletCredential["kind"] }) {
  return (
    <Badge variant="secondary" className="max-w-full font-medium">
      <span className="truncate">{KIND_LABEL[kind]}</span>
    </Badge>
  );
}

export function SkillChip({
  name,
  className,
  onRemove,
}: {
  name: string;
  className?: string;
  onRemove?: () => void;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-[#dbeafe] bg-[#eef6fc] px-2.5 py-0.5 text-xs font-medium text-[#0058cc]",
        className,
      )}
    >
      {name}
      {onRemove ? (
        <button
          type="button"
          aria-label={`Remove ${name}`}
          onClick={onRemove}
          className="-mr-1 rounded-full px-1 hover:bg-[#dbeafe]"
        >
          ×
        </button>
      ) : null}
    </span>
  );
}

/** Lucide ships no brand marks; LinkedIn's wordmark-free "in" glyph, sized like a Lucide icon. */
export function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
      width="16"
      height="16"
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}
