"use client";

import { useDispatch, useSelector } from "react-redux";
import { UpgradePackageModal } from "@iblai/iblai-js/web-containers";
import { setOpenPricingModal } from "@iblai/iblai-js/web-utils";
import config from "@/lib/iblai/config";
import { createOrganizationUrl, loginReturnUrl } from "@/lib/iblai/auth-redirect";

type State = { subscription?: { openPricingModal?: boolean } };

/**
 * The SDK's "Upgrade for free" dialog — the $0 checkout that gives a user on
 * the community organization one of their own. Opened by a change to the
 * sample wallet and by the sample notice; mounted once in the app layout.
 */
export function UpgradeModal({ org, email }: { org: string; email: string }) {
  const dispatch = useDispatch();
  const open = useSelector((state: State) => !!state.subscription?.openPricingModal);
  if (!open) return null;
  return (
    <UpgradePackageModal
      open
      onClose={() => dispatch(setOpenPricingModal(false))}
      redirectUrl={loginReturnUrl(config.appUrl())}
      checkoutUrl={createOrganizationUrl(config.appUrl(), email)}
      sourcePlatformKey={org}
      mainPlatformKey={config.mainTenantKey()}
      currentUserEmail={email}
    />
  );
}
