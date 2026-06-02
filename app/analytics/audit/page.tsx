"use client";

import { useEffect, useState } from "react";
import { AnalyticsAuditLogStats } from "@iblai/iblai-js/web-containers";

import { resolveAppTenant } from "@/lib/iblai/tenant";

function readUsername(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem("userData");
    if (!raw) return "";
    const d = JSON.parse(raw) as Record<string, string>;
    return d.user_nicename ?? d.username ?? "";
  } catch {
    return "";
  }
}

export default function AnalyticsAuditPage() {
  const [tenantKey, setTenantKey] = useState("");
  const [userId, setUserId] = useState("");
  useEffect(() => {
    setTenantKey(resolveAppTenant());
    setUserId(readUsername());
  }, []);
  if (!tenantKey || !userId) return null;
  return <AnalyticsAuditLogStats tenantKey={tenantKey} mentorId="" userId={userId} />;
}
