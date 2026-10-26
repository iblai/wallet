"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CreateAgentModal,
  OnboardingShell,
  StepHeader,
  onboardingPrimaryButtonClass,
  onboardingSecondaryButtonClass,
} from "@iblai/iblai-js/web-containers";
import { MentorSelectionGrid } from "@iblai/iblai-js/web-containers/next";
import config from "@/lib/iblai/config";
import { useOrgSettings } from "@/lib/iblai/metadata";
import { resolveAppTenant } from "@/lib/iblai/tenant";

const currentUsername = () => {
  try {
    return (JSON.parse(localStorage.getItem("userData") ?? "{}").user_nicename as string) ?? "";
  } catch {
    return "";
  }
};

/**
 * One screen: which agent the Coach chats with. An admin picks one of the
 * platform's agents (SDK `MentorSelectionGrid`) or creates one (SDK
 * `CreateAgentModal`); Save writes it to the platform's metadata under
 * `apps.credential-wallet`, through the GET-merge-PUT helper.
 */
export function SetupScreen() {
  const router = useRouter();
  const { settings, platformDefaultAgentId, update, isLoading } = useOrgSettings();
  const [org] = useState(resolveAppTenant);
  const [username] = useState(currentUsername);
  const [picked, setPicked] = useState("");
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const selected = picked || settings.defaultAgentId || platformDefaultAgentId;
  const envAgent = config.defaultAgentId();

  const save = async (agentId: string) => {
    setBusy(true);
    setError("");
    try {
      await update({ defaultAgentId: agentId });
      router.replace("/coach");
    } catch (e) {
      setError(messageOf(e));
      setBusy(false);
    }
  };

  return (
    <OnboardingShell totalSteps={1} currentStep={1}>
      <StepHeader
        title="Which agent is the Coach?"
        subtitle={
          envAgent
            ? "NEXT_PUBLIC_DEFAULT_AGENT_ID is set, so the Coach uses that agent; a choice saved here applies once it is unset."
            : "People chat with it on the Coach page. Until you choose, the Coach uses your platform's default agent."
        }
      />
      <MentorSelectionGrid
        tenantKey={org}
        selectedMentorIds={selected ? [selected] : []}
        onMentorSelect={(agent: { unique_id?: string }) => setPicked(agent.unique_id ?? "")}
        searchQuery={query}
        onSearchChange={setQuery}
      />
      {error && (
        <p role="alert" className="text-destructive mt-4 text-sm">
          {error}
        </p>
      )}
      <button
        type="button"
        className={`mt-6 ${onboardingPrimaryButtonClass}`}
        disabled={!selected || busy || isLoading}
        onClick={() => void save(selected)}
      >
        {busy ? "Saving…" : "Save"}
      </button>
      <button
        type="button"
        className={`mt-3 ${onboardingSecondaryButtonClass}`}
        disabled={busy}
        onClick={() => setCreating(true)}
      >
        Create a new agent
      </button>
      {settings.defaultAgentId ? (
        <button
          type="button"
          className={`mt-2 ${onboardingSecondaryButtonClass}`}
          disabled={busy}
          onClick={() => void save("")}
        >
          Use the platform's default agent
        </button>
      ) : null}
      <button
        type="button"
        className={`mt-2 ${onboardingSecondaryButtonClass}`}
        onClick={() => router.push("/coach")}
      >
        Cancel
      </button>
      <CreateAgentModal
        isOpen={creating}
        onClose={() => setCreating(false)}
        org={org}
        username={username}
        onCreated={(agent) => {
          if (agent.unique_id) void save(agent.unique_id);
          else setError("The new agent came back without an id; pick it from the list.");
        }}
        onError={(e) => toast.error(messageOf(e))}
      />
    </OnboardingShell>
  );
}

const messageOf = (e: unknown) =>
  e instanceof Error
    ? e.message
    : `The platform refused it (${String((e as { status?: unknown } | null)?.status ?? "no response")}).`;
