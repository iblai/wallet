"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { OnboardingShell } from "@iblai/iblai-js/web-containers";
import { setOpenPricingModal } from "@iblai/iblai-js/web-utils";
import config from "@/lib/iblai/config";
import { isSampleOrg } from "@/lib/iblai/house-journeys";
import { isTenantAdmin, resolveAppTenant } from "@/lib/iblai/tenant";
import { LoadingScreen } from "@/components/loading-screen";
import { SetupScreen } from "@/components/setup/setup-screen";

/**
 * Admins choose the Coach's agent. Outside the (app) group on purpose — sign-in
 * gated by the providers, but no navbar: the SDK's onboarding canvas is the
 * whole page. Anyone else goes back to the Coach: the sample upgrades, a member is told.
 */
export default function SetupPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  // Read once on the client: the providers hold this tree until mounted.
  const [isAdmin] = useState(() => typeof window !== "undefined" && isTenantAdmin());
  const [sample] = useState(() => isSampleOrg(resolveAppTenant()));
  const demo = config.demoMode();

  useEffect(() => {
    if (demo || isAdmin) return;
    if (sample) dispatch(setOpenPricingModal(true));
    else toast.error("Only admins of this platform can choose the Coach's agent.");
    router.replace("/coach");
  }, [demo, isAdmin, sample, dispatch, router]);

  if (demo)
    return (
      <OnboardingShell totalSteps={1} currentStep={1}>
        <p role="alert" className="text-muted-foreground text-sm">
          This demo has no platform, so there is no agent to choose.
        </p>
      </OnboardingShell>
    );
  if (!isAdmin) return <LoadingScreen />;
  return <SetupScreen />;
}
