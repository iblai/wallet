"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  OnboardingShell,
  StepHeader,
  onboardingPrimaryButtonClass,
  onboardingSecondaryButtonClass,
} from "@iblai/iblai-js/web-containers";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import config from "@/lib/iblai/config";
import { useOrgSettings } from "@/lib/iblai/metadata";
import { sessionFetch } from "@/lib/iblai/session-fetch";
import { resolveAppTenant } from "@/lib/iblai/tenant";

type AgentSummary = { unique_id: string; name: string; description?: string };

const me = () => {
  const org = resolveAppTenant();
  let username = "";
  try {
    username = JSON.parse(localStorage.getItem("userData") ?? "{}").user_nicename ?? "";
  } catch {}
  return { org, username };
};

type Step = "name" | "agent";

/**
 * Two screens. 1: what the app is called. 2: which agent the home page chats
 * with — pick one of the org's agents or create a new one, as the signed-in
 * admin against ibl.ai directly (no server of ours). Both answers are saved to the org's metadata under
 * `apps.<slug>` through the GET-merge-PUT helper, as the signed-in admin.
 * NEXT_PUBLIC_DEFAULT_AGENT_ID, when set, wins over the saved agent.
 */
export function SetupScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const { settings, update, isLoading } = useOrgSettings();

  const [step, setStep] = useState<Step>(params.get("step") === "agent" ? "agent" : "name");
  const [appName, setAppName] = useState("");
  const [agents, setAgents] = useState<AgentSummary[] | null>(null);
  const [selected, setSelected] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPurpose, setNewPurpose] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Returning admins see their current answers.
  useEffect(() => {
    if (isLoading) return;
    setAppName((v) => v || settings.appName || config.appName() || "");
    setSelected((v) => v || settings.defaultAgentId || "");
  }, [isLoading, settings.appName, settings.defaultAgentId]);

  useEffect(() => {
    if (step !== "agent" || agents) return;
    const { org, username } = me();
    sessionFetch<{ results?: AgentSummary[] } | AgentSummary[]>(`/api/search/orgs/${encodeURIComponent(org)}/users/${encodeURIComponent(username)}/mentors/`)
      .then((d) => setAgents((Array.isArray(d) ? d : (d.results ?? [])).map((a) => ({ unique_id: a.unique_id, name: a.name, description: a.description ?? "" }))))
      .catch((e) => setError(messageOf(e)));
  }, [step, agents]);

  const envAgent = config.defaultAgentId();

  const onName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim()) {
      setError("Give the app a name.");
      return;
    }
    setError("");
    setStep("agent");
  };

  const finish = async (agentId: string) => {
    setBusy(true);
    setError("");
    try {
      await update({
        appName: appName.trim(),
        defaultAgentId: agentId,
        setupCompletedAt: new Date().toISOString(),
      });
      router.replace("/");
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setBusy(false);
    }
  };

  const onAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating) {
      if (!newName.trim()) {
        setError("Give the agent a name.");
        return;
      }
      setBusy(true);
      setError("");
      try {
        const { org, username } = me();
        const created = await sessionFetch<{ unique_id: string }>(
          `/api/ai-mentor/orgs/${encodeURIComponent(org)}/users/${encodeURIComponent(username)}/mentor-with-settings/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              template_name: "ai-mentor",
              new_mentor_name: newName.trim(),
              display_name: newName.trim(),
              description: newPurpose.trim(),
              system_prompt: newPurpose.trim(),
            }),
          },
        );
        await finish(created.unique_id);
      } catch (err) {
        setError(messageOf(err));
        setBusy(false);
      }
      return;
    }
    if (!selected && !envAgent) {
      setError("Pick an agent or create one.");
      return;
    }
    await finish(selected || envAgent);
  };

  return (
    <OnboardingShell totalSteps={2} currentStep={step === "name" ? 1 : 2}>
      {step === "name" ? (
        <form onSubmit={onName}>
          <StepHeader
            title="What is this app called?"
            subtitle="Shown in the browser tab and to the people you invite. You can change it later under Organization."
          />
          <div className="space-y-2">
            <Label htmlFor="app-name">App name</Label>
            <Input
              id="app-name"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="Acme Support"
            />
          </div>
          {error && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {error}
            </p>
          )}
          <button type="submit" className={`mt-6 ${onboardingPrimaryButtonClass}`} disabled={isLoading}>
            Continue
          </button>
        </form>
      ) : (
        <form onSubmit={onAgent}>
          <StepHeader
            title="Which agent does the home page talk to?"
            subtitle={
              envAgent
                ? "NEXT_PUBLIC_DEFAULT_AGENT_ID is set, so that agent is used. You can still record a choice here for when it is unset."
                : "Pick one of your organization's agents, or create a new one now."
            }
          />
          {!creating ? (
            <fieldset className="space-y-2">
              <legend className="sr-only">Agent</legend>
              {agents === null && !error && <p className="text-sm text-muted-foreground">Loading agents…</p>}
              {agents?.length === 0 && (
                <p className="text-sm text-muted-foreground">No agents yet — create one below.</p>
              )}
              {agents?.map((a) => {
                const on = selected === a.unique_id;
                return (
                  <label
                    key={a.unique_id}
                    className={cn(
                      "flex w-full cursor-pointer flex-col items-start gap-0.5 rounded-xl border p-3 text-left transition-all focus-within:ring-2 focus-within:ring-[#2563EB]",
                      on ? "border-[#2563EB] bg-[#2563EB]/[0.06] ring-1 ring-[#2563EB]" : "border-gray-200 hover:border-gray-300",
                    )}
                  >
                    <input
                      type="radio"
                      name="agent"
                      value={a.unique_id}
                      checked={on}
                      onChange={() => setSelected(a.unique_id)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium text-gray-900">{a.name}</span>
                    {a.description && <span className="line-clamp-2 text-xs text-gray-500">{a.description}</span>}
                  </label>
                );
              })}
            </fieldset>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Agent name</Label>
                <Input id="agent-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Support Assistant" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-purpose">What it does (one line)</Label>
                <Input
                  id="agent-purpose"
                  value={newPurpose}
                  onChange={(e) => setNewPurpose(e.target.value)}
                  placeholder="Answers customer questions about orders and returns."
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Created from the platform's default template; refine prompts, datasets, and tools later (see /iblai-vibe-agent).
              </p>
            </div>
          )}
          {error && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {error}
            </p>
          )}
          <button type="submit" className={`mt-6 ${onboardingPrimaryButtonClass}`} disabled={busy}>
            {busy ? "Saving…" : creating ? "Create and finish" : "Finish"}
          </button>
          <button
            type="button"
            className={`mt-3 ${onboardingSecondaryButtonClass}`}
            onClick={() => {
              setCreating((c) => !c);
              setError("");
            }}
          >
            {creating ? "Pick an existing agent instead" : "Create a new agent instead"}
          </button>
          <button type="button" className={`mt-2 ${onboardingSecondaryButtonClass}`} onClick={() => setStep("name")}>
            Back
          </button>
        </form>
      )}
    </OnboardingShell>
  );
}

const messageOf = (e: unknown) =>
  e instanceof Error ? e.message : "Something went wrong; try again.";
