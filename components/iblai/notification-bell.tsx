"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NotificationDropdown } from "@iblai/iblai-js/web-containers";

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

export function NotificationBell() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState("");
  const [tenantKey, setTenantKey] = useState("");

  useEffect(() => {
    setUsername(readUsername());
    setTenantKey(resolveAppTenant());
    setMounted(true);
  }, []);

  if (!mounted || !username || !tenantKey) return null;

  return (
    <NotificationDropdown
      org={tenantKey}
      userId={username}
      onViewNotifications={(id) => {
        const qs = id ? `?id=${encodeURIComponent(id)}` : "";
        router.push(`/notifications${qs}`);
      }}
    />
  );
}
