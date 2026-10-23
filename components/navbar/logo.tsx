"use client";

import Image from "next/image";
import Link from "next/link";
import { useSidebar } from "@iblai/iblai-js/web-containers/next";
import config from "@/lib/iblai/config";

/** The sidebar logo: the org's own from the DM (ibl.ai's when it has none); the static mark in demo mode. */
export function Logo({
  tenantKey,
  currentTenant,
  demo,
}: {
  tenantKey?: string;
  currentTenant?: { name?: string | null } | null;
  demo?: boolean;
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  return (
    <Link href="/" className="flex items-center" onClick={() => isMobile && setOpenMobile(false)}>
      {!demo && tenantKey ? (
        <Image
          src={`${config.dmUrl()}/api/core/orgs/${encodeURIComponent(tenantKey)}/logo/`}
          alt={currentTenant?.name ?? tenantKey}
          width={120}
          height={40}
          unoptimized
          className="h-8 w-auto max-w-full object-contain"
        />
      ) : (
        <Image
          src="/images/iblai-logo.png"
          alt="ibl.ai"
          width={120}
          height={40}
          className="h-6 w-auto sm:h-7 md:h-8"
          priority
        />
      )}
    </Link>
  );
}
