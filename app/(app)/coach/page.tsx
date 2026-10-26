"use client";

import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useOrgSettings } from "@/lib/iblai/metadata";
import { useAdminMode } from "@/lib/iblai/admin-mode";
import config from "@/lib/iblai/config";
import { AgentChat } from "@/components/wallet/agent-chat";
import { Page } from "@/components/wallet/section";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { LoadingScreen } from "@/components/loading-screen";
import { Button } from "@/components/ui/button";

/**
 * Coach: the SDK <Chat> with the wallet's agent — `?agent=`, then
 * NEXT_PUBLIC_DEFAULT_AGENT_ID, then the one an admin chose on /setup, then
 * the platform's own default agent.
 */
export default function CoachPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      {config.demoMode() ? (
        <NoCoach
          title="The Coach needs a platform"
          description="It chats with your platform's agent; this demo runs on sample data with no platform."
        />
      ) : (
        <PlatformCoach />
      )}
    </Suspense>
  );
}

function PlatformCoach() {
  const searchParams = useSearchParams();
  const { isAdmin } = useAdminMode();
  const { settings, platformDefaultAgentId, isLoading } = useOrgSettings();
  const mentorId =
    searchParams.get("agent") ||
    config.defaultAgentId() ||
    settings.defaultAgentId ||
    platformDefaultAgentId;
  if (isLoading) return <LoadingScreen />;
  if (!mentorId)
    return (
      <NoCoach
        title="No agent for the Coach yet"
        description={
          isAdmin
            ? "Choose one of your platform's agents, or create one."
            : "Ask an admin of this platform to choose one."
        }
        action={
          isAdmin ? (
            <Button
              nativeButton={false}
              render={<Link href="/setup" />}
              className="ibl-button-primary"
            >
              Choose an agent
            </Button>
          ) : undefined
        }
      />
    );
  return (
    <div className="flex h-[calc(100dvh-5rem)] flex-col md:h-auto md:min-h-0 md:flex-1">
      <AgentChat mentorId={mentorId} />
    </div>
  );
}

function NoCoach({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader icon={<Sparkles />} title="Coach" />
      <Page>
        <EmptyState icon={<Sparkles />} title={title} description={description} action={action} />
      </Page>
    </div>
  );
}
