"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreateAgentModal } from "@iblai/iblai-js/web-containers";
import { AgentSearch } from "@iblai/iblai-js/web-containers/next";
import config from "@/lib/iblai/config";
import { resolveAppTenant } from "@/lib/iblai/tenant";
import { useAdminMode } from "@/lib/iblai/admin-mode";

/**
 * Browse the agents this user can reach — starred, featured, the org's own,
 * and all — and start a chat with one. Admins in Admin mode also get the
 * SDK's "Create agent" action; the new agent opens on /coach.
 */
export default function AgentsPage() {
  const router = useRouter();
  const { adminMode } = useAdminMode();
  const [tenantKey, setTenantKey] = useState("");
  const [username, setUsername] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("userData");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUsername(parsed.user_nicename ?? parsed.username ?? "");
      }
    } catch {}
    setTenantKey(resolveAppTenant());
  }, []);

  if (!tenantKey) return null;

  const openOnCoach = (id: string) =>
    router.push(`/coach?agent=${encodeURIComponent(id)}&new=${Date.now()}`);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AgentSearch
        tenantKey={tenantKey}
        username={username}
        mainTenantKey={config.mainTenantKey()}
        onAgentClick={(agent) => openOnCoach(agent.unique_id)}
        onCreateAgent={adminMode ? () => setCreating(true) : undefined}
      />
      <CreateAgentModal
        isOpen={creating}
        onClose={() => setCreating(false)}
        org={tenantKey}
        username={username ?? ""}
        onCreated={(agent) => {
          if (agent.unique_id) openOnCoach(agent.unique_id);
        }}
        onError={() => toast.error("Could not create the agent")}
      />
    </div>
  );
}
