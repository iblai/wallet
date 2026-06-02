"use client";

import { useEffect, useState } from "react";
import { AnalyticsTranscriptsStats } from "@iblai/iblai-js/web-containers";

import { resolveAppTenant } from "@/lib/iblai/tenant";

export default function AnalyticsTranscriptsPage() {
  const [tenantKey, setTenantKey] = useState("");
  useEffect(() => {
    setTenantKey(resolveAppTenant());
  }, []);
  if (!tenantKey) return null;
  return <AnalyticsTranscriptsStats tenantKey={tenantKey} mentorId="" />;
}
