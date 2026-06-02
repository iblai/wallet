"use client";

import { useEffect, useState } from "react";
import { AnalyticsUsersStats } from "@iblai/iblai-js/web-containers";

import { resolveAppTenant } from "@/lib/iblai/tenant";

export default function AnalyticsUsersPage() {
  const [tenantKey, setTenantKey] = useState("");
  useEffect(() => {
    setTenantKey(resolveAppTenant());
  }, []);
  if (!tenantKey) return null;
  return <AnalyticsUsersStats tenantKey={tenantKey} mentorId="" />;
}
