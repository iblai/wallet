"use client";

import { useEffect, useState } from "react";
import { AnalyticsTopicsStats } from "@iblai/iblai-js/web-containers";

import { resolveAppTenant } from "@/lib/iblai/tenant";

export default function AnalyticsTopicsPage() {
  const [tenantKey, setTenantKey] = useState("");
  useEffect(() => {
    setTenantKey(resolveAppTenant());
  }, []);
  if (!tenantKey) return null;
  return <AnalyticsTopicsStats tenantKey={tenantKey} mentorId="" />;
}
