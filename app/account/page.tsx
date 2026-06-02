"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Account } from "@iblai/iblai-js/web-containers/next";
import type { Tenant } from "@iblai/iblai-js/web-utils";

import { MainLayout } from "@/components/layout/main-layout";
import config from "@/lib/iblai/config";
import { resolveAppTenant } from "@/lib/iblai/tenant";

export default function AccountPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [tenantKey, setTenantKey] = useState("");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("userData");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUsername(parsed.user_nicename ?? parsed.username ?? "");
        setEmail(parsed.email ?? parsed.user_email ?? "");
      }
    } catch {}

    const resolved = resolveAppTenant();
    setTenantKey(resolved);

    try {
      const tenantsRaw = localStorage.getItem("tenants");
      if (tenantsRaw) {
        const parsed = JSON.parse(tenantsRaw) as Tenant[];
        setTenants(parsed);
        const match = parsed.find((t) => t.key === resolved);
        if (match) setIsAdmin(!!match.is_admin);
      }
    } catch {}

    setReady(true);
  }, []);

  return (
    <MainLayout>
      <div className="account-management-only h-[calc(100dvh-65px)] bg-white overflow-auto">
        {!ready || !tenantKey ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-400">Loading account settings...</p>
          </div>
        ) : (
          <Account
            tenant={tenantKey}
            tenants={tenants}
            username={username}
            email={email}
            mainPlatformKey={config.mainTenantKey()}
            isAdmin={isAdmin}
            authURL={config.authUrl()}
            currentPlatformBaseDomain={config.platformBaseDomain()}
            currentSPA="agent"
            onInviteClick={() => {}}
            onClose={() => router.push("/")}
            targetTab="management"
            showPlatformName
            useGravatarPicFallback
          />
        )}
      </div>
    </MainLayout>
  );
}
