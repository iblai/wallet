"use client";

import { useDispatch } from "react-redux";
import { CircleAlert } from "lucide-react";
import { setOpenPricingModal } from "@iblai/iblai-js/web-utils";

/** One line above every page on the community organization, so nobody mistakes the sample for their own wallet. */
export function SampleNotice() {
  const dispatch = useDispatch();
  return (
    <div
      data-testid="sample-notice"
      className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b border-amber-100 bg-amber-50/60 px-4 py-2 text-sm text-amber-900"
    >
      <CircleAlert className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
      <span>
        You’re looking at Jordan Rivera’s sample wallet. Yours fills in with the credentials your
        organization issues you.
      </span>
      <button
        type="button"
        className="cursor-pointer font-medium text-amber-900 underline underline-offset-4 hover:text-amber-950"
        onClick={() => dispatch(setOpenPricingModal(true))}
      >
        Create your organization
      </button>
    </div>
  );
}
