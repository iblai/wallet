"use client";

/**
 * The starter's home-page chat, moved here: the SDK <Chat> with the Coach's
 * agent, mounted by the Coach page for a signed-in user.
 * Everything below is vibe-starter's app/(app)/page.tsx, unchanged in logic.
 */
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Chat, type ChatConfig } from "@iblai/iblai-js/web-containers/next";
import {
  useUsername,
  useAxdToken,
  useUserTenants,
  useVisitingTenant,
  useCachedSessionId,
} from "@iblai/iblai-js/web-utils";
import { useAgentPermissions } from "@/lib/iblai/agent-permissions";
import { redirectToAuthSpa } from "@/lib/iblai/auth-utils";
import config from "@/lib/iblai/config";
import { resolveAppTenant } from "@/lib/iblai/tenant";
import { useAdminMode } from "@/lib/iblai/admin-mode";

export function AgentChat({ mentorId }: { mentorId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { adminMode } = useAdminMode();

  const restoreSessionId = searchParams.get("session") ?? undefined;
  const newParam = searchParams.get("new") ?? undefined;
  const [cachedSessionId, saveCachedSessionId] = useCachedSessionId();
  const [seededFor, setSeededFor] = useState<string | undefined>(
    restoreSessionId || newParam ? undefined : "none",
  );
  useEffect(() => {
    if (!mentorId) {
      setSeededFor("none");
      return;
    }
    const map = { ...((cachedSessionId ?? {}) as Record<string, string>) };
    if (restoreSessionId) {
      if (map[mentorId] !== restoreSessionId)
        saveCachedSessionId({ ...map, [mentorId]: restoreSessionId });
      setSeededFor(restoreSessionId);
    } else if (newParam) {
      if (map[mentorId]) {
        delete map[mentorId];
        saveCachedSessionId(map);
      }
      setSeededFor(`new:${newParam}`);
    } else setSeededFor("none");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restoreSessionId, newParam, mentorId]);
  const sessionReady = restoreSessionId
    ? seededFor === restoreSessionId
    : newParam
      ? seededFor === `new:${newParam}`
      : true;

  const [tenantKey] = useState(resolveAppTenant);
  useAgentPermissions(mentorId, tenantKey);
  const username = useUsername();
  const axdToken = useAxdToken();
  const { userTenants } = useUserTenants();
  const { visitingTenant } = useVisitingTenant();

  const chatConfig: ChatConfig = {
    baseWsUrl: () => config.baseWsUrl(),
    supportEmail: () => config.supportEmail(),
    authUrl: () => config.authUrl(),
    mainTenantKey: config.mainTenantKey(),
    navigateToAdminBilling: () => router.push("/admin/billing"),
    navigateToExplore: () => router.push("/agents"),
    navigateToMentor: (id: string) => router.push(`/coach?agent=${encodeURIComponent(id)}`),
  };

  if (!tenantKey || !mentorId || !sessionReady) return null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Chat
        key={`${mentorId}:${restoreSessionId ?? ""}:${newParam ?? ""}`}
        isPreviewMode={false}
        mentorId={mentorId}
        tenantKey={tenantKey}
        config={chatConfig}
        redirectToAuthSpa={(to, key, logout) => void redirectToAuthSpa(to, key, logout)}
        username={username ?? null}
        userTenants={userTenants ?? []}
        visitingTenant={visitingTenant}
        axdToken={axdToken ?? ""}
        userIsStudent={!adminMode}
      />
    </div>
  );
}
