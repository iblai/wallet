"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { NotificationDisplay } from "@iblai/iblai-js/web-containers";
import type { Tenant } from "@iblai/iblai-js/web-utils";

import { MainLayout } from "@/components/layout/main-layout";
import { resolveAppTenant } from "@/lib/iblai/tenant";

function NotificationsContent() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id") ?? undefined;

  const [tenantKey, setTenantKey] = useState("");
  const [username, setUsername] = useState("");
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
        const match = parsed.find((t) => t.key === resolved);
        if (match) setIsAdmin(!!match.is_admin);
      }
    } catch {}

    setReady(true);
  }, []);

  if (!ready || !tenantKey || !username) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <p className="text-sm text-gray-400">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl rounded-lg border border-gray-200 bg-white">
        <NotificationDisplay
          org={tenantKey}
          userId={username}
          isAdmin={isAdmin}
          selectedNotificationId={selectedId}
        />
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <MainLayout>
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center py-20">
            <p className="text-sm text-gray-400">Loading notifications...</p>
          </div>
        }
      >
        <NotificationsContent />
      </Suspense>
    </MainLayout>
  );
}
