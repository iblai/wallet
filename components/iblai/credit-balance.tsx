"use client";

import { useEffect, useMemo, useState } from "react";
import { CreditBalance } from "@iblai/iblai-js/web-containers";
import type { Tenant } from "@iblai/iblai-js/web-utils";

import config from "@/lib/iblai/config";
import { resolveAppTenant } from "@/lib/iblai/tenant";

interface SessionData {
  username: string;
  email: string;
}

function readSession(): SessionData {
  if (typeof window === "undefined") return { username: "", email: "" };
  try {
    const raw = localStorage.getItem("userData");
    if (!raw) return { username: "", email: "" };
    const d = JSON.parse(raw) as Record<string, string>;
    return {
      username: d.user_nicename ?? d.username ?? "",
      email: d.email ?? d.user_email ?? "",
    };
  } catch {
    return { username: "", email: "" };
  }
}

function readTenants(): Tenant[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("tenants");
    return raw ? (JSON.parse(raw) as Tenant[]) : [];
  } catch {
    return [];
  }
}

export function CreditBalanceWidget() {
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<SessionData>({ username: "", email: "" });
  const [tenantKey, setTenantKey] = useState("");
  const [tenants, setTenants] = useState<Tenant[]>([]);

  useEffect(() => {
    setSession(readSession());
    setTenantKey(resolveAppTenant());
    setTenants(readTenants());
    setMounted(true);
  }, []);

  const currentTenant = useMemo(
    () => tenants.find((t) => t.key === tenantKey),
    [tenants, tenantKey],
  );

  const showPaywall = !!currentTenant?.show_paywall;
  const isAdmin = !!currentTenant?.is_admin;
  const isLoggedIn = !!session.username && !!tenantKey;

  if (!mounted || !isLoggedIn || !showPaywall || !isAdmin) return null;

  return (
    <CreditBalance
      tenant={tenantKey}
      username={session.username}
      currentUserEmail={session.email}
      mainPlatformKey={config.mainTenantKey()}
      redirectUrl={window.location.origin}
      enabled={true}
    />
  );
}
