"use client";

import { useEffect, useState } from "react";
import { AnalyticsCourses } from "@iblai/iblai-js/web-containers";

import { resolveAppTenant } from "@/lib/iblai/tenant";

export default function AnalyticsCoursesPage() {
  const [tenantKey, setTenantKey] = useState("");
  useEffect(() => {
    setTenantKey(resolveAppTenant());
  }, []);
  if (!tenantKey) return null;
  return <AnalyticsCourses tenantKey={tenantKey} mentorId="" basePath="/analytics" />;
}
