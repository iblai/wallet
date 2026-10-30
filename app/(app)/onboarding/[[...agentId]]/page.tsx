"use client";

import { OnboardingPage } from "@/components/house/onboarding-page";
import { resolveAppTenant } from "@/lib/iblai/tenant";

export default function Page() {
  return <OnboardingPage org={resolveAppTenant()} home="/" />;
}
