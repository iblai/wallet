"use client";

import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { useWallet } from "@/lib/wallet/provider";

/** One line, above every page, so nobody mistakes sample data for their own. */
export function DemoBanner() {
  const { actions } = useWallet();
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-center text-xs text-amber-900">
      <span className="inline-flex items-center gap-1.5">
        <FlaskConical className="size-3.5" />
        <strong className="font-semibold">Demo wallet.</strong> Sample learner, sample credentials;
        edits stay in this browser.
      </span>
      <button
        type="button"
        className="underline underline-offset-2 hover:text-amber-700"
        onClick={() => actions.resetDemo()}
      >
        Reset sample data
      </button>
      <Link href="/profile#connect" className="underline underline-offset-2 hover:text-amber-700">
        Connect your ibl.ai organization
      </Link>
    </div>
  );
}
