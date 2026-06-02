"use client";

import { useEffect, useState } from "react";
import { Profile } from "@iblai/iblai-js/web-containers";
import type { Tenant } from "@iblai/iblai-js/web-utils";

import { MainLayout } from "@/components/layout/main-layout";
import { resolveAppTenant } from "@/lib/iblai/tenant";

export default function ProfilePage() {
  const [tenantKey, setTenantKey] = useState("");
  const [username, setUsername] = useState("");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("userData");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUsername(parsed.user_nicename ?? parsed.username ?? "");
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
      {!ready || !tenantKey ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <p className="text-sm text-gray-400">Loading profile...</p>
        </div>
      ) : (
        <div className="mx-auto w-full flex-1 overflow-auto px-4 py-8 md:w-[75vw] md:px-0">
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <Profile
              tenant={tenantKey}
              username={username}
              tenants={tenants}
              isAdmin={isAdmin}
              onClose={() => {}}
              customization={{
                showPlatformName: true,
                useGravatarPicFallback: true,
              }}
              targetTab="basic"
            />
          </div>
        </div>
      )}
    </MainLayout>
  );
}
