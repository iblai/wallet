"use client";

import { useEffect, useState } from "react";
import { AnalyticsReports } from "@iblai/iblai-js/web-containers";

import { resolveAppTenant } from "@/lib/iblai/tenant";

export default function AnalyticsReportsPage() {
  const [tenantKey, setTenantKey] = useState("");
  useEffect(() => {
    setTenantKey(resolveAppTenant());
  }, []);
  if (!tenantKey) return null;
  return <AnalyticsReports tenantKey={tenantKey} mentorId="" />;
}
