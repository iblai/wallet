"use client";

import { useEffect, useMemo, useState } from "react";
import { UserProfileDropdown } from "@iblai/iblai-js/web-containers/next";
import type { Tenant } from "@iblai/iblai-js/web-utils";

import config from "@/lib/iblai/config";
import { handleLogout, redirectToAuthSpa } from "@/lib/iblai/auth-utils";
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

export function IblaiProfileDropdown() {
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<SessionData>({ username: "", email: "" });
  const [tenantKey, setTenantKey] = useState("");
  const [userTenants, setUserTenants] = useState<Tenant[]>([]);

  useEffect(() => {
    setSession(readSession());
    setTenantKey(resolveAppTenant());
    setUserTenants(readTenants());
    setMounted(true);
  }, []);

  const isAdmin = useMemo(() => {
    const match = userTenants.find((t) => t.key === tenantKey);
    return !!match?.is_admin;
  }, [userTenants, tenantKey]);

  if (!mounted) return null;

  return (
    <UserProfileDropdown
      email={session.email}
      authURL={config.authUrl()}
      mainPlatformKey={config.mainTenantKey()}
      username={session.username}
      tenantKey={tenantKey}
      userIsAdmin={isAdmin}
      userTenants={userTenants}
      showProfileTab
      showAccountTab
      showTenantSwitcher
      showLogoutButton
      onLogout={() => handleLogout()}
      onTenantUpdate={(tenant) => {
        // Mirror the TenantProvider's saveCurrentTenant + handleTenantSwitch:
        // persist the selected tenant and re-auth against it.
        localStorage.setItem("current_tenant", tenant.key);
        localStorage.setItem("tenant", tenant.key);
        redirectToAuthSpa(undefined, tenant.key, false, true);
      }}
    />
  );
}
