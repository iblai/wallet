"use client";

import { useState } from "react";
import { OnboardingShell } from "@iblai/iblai-js/web-containers";
import config from "@/lib/iblai/config";
import { isTenantAdmin } from "@/lib/iblai/tenant";
import { SetupScreen } from "@/components/setup/setup-screen";

/**
 * Admins choose the Coach's agent. Outside the (app) group on purpose — sign-in
 * gated by the providers, but no navbar: the SDK's onboarding canvas is the
 * whole page.
 */
export default function SetupPage() {
  // Read once on the client: the providers hold this tree until mounted.
  const [isAdmin] = useState(() => typeof window !== "undefined" && isTenantAdmin());
  const demo = config.demoMode();

  if (isAdmin && !demo) return <SetupScreen />;
  return (
    <OnboardingShell totalSteps={1} currentStep={1}>
      <p
        role="alert"
        className={demo ? "text-muted-foreground text-sm" : "text-destructive text-sm"}
      >
        {demo
          ? "This demo has no platform, so there is no agent to choose."
          : "Only admins of this platform can choose the Coach's agent."}
      </p>
    </OnboardingShell>
  );
}
