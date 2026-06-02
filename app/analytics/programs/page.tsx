"use client";

import { useEffect, useState } from "react";
import { AnalyticsPrograms } from "@iblai/iblai-js/web-containers";

import { resolveAppTenant } from "@/lib/iblai/tenant";

export default function AnalyticsProgramsPage() {
  const [tenantKey, setTenantKey] = useState("");
  useEffect(() => {
    setTenantKey(resolveAppTenant());
  }, []);
  if (!tenantKey) return null;
  return <AnalyticsPrograms tenantKey={tenantKey} mentorId="" basePath="/analytics" />;
}
