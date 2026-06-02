"use client";

import { useEffect, useState } from "react";
import { AnalyticsFinancialStats } from "@iblai/iblai-js/web-containers";

import { resolveAppTenant } from "@/lib/iblai/tenant";

export default function AnalyticsFinancialPage() {
  const [tenantKey, setTenantKey] = useState("");
  useEffect(() => {
    setTenantKey(resolveAppTenant());
  }, []);
  if (!tenantKey) return null;
  return <AnalyticsFinancialStats tenantKey={tenantKey} mentorId="" />;
}
