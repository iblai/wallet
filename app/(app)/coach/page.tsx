"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Bot, Copy, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Markdown } from "@iblai/iblai-js/web-containers";
import { useWallet } from "@/lib/wallet/provider";
import { COACH_PROMPTS, coachAnswer, routeQuestion } from "@/lib/wallet/coach";
import { useOrgSettings } from "@/lib/iblai/metadata";
import { useAdminMode } from "@/lib/iblai/admin-mode";
import config from "@/lib/iblai/config";
import { resolveAppTenant } from "@/lib/iblai/tenant";
import { AgentChat } from "@/components/wallet/agent-chat";
import { Page } from "@/components/wallet/section";
import { PageHeader } from "@/components/page-header";
import { LoadingScreen } from "@/components/loading-screen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Coach. With an ibl.ai agent configured (and a signed-in user) this is the
 * SDK <Chat> — the org's agent, with memory, RAG and tools. Without one, the
 * built-in Coach answers from the wallet itself: deterministic, instant,
 * and honest about being rule-based.
 */
export default function CoachPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Coach />
    </Suspense>
  );
}

function Coach() {
  const demo = config.demoMode();
  return demo ? <BuiltInCoach /> : <PlatformCoach />;
}

function PlatformCoach() {
  const searchParams = useSearchParams();
  const { isAdmin } = useAdminMode();
  const { settings: org, isLoading } = useOrgSettings();
  const mentorId = searchParams.get("agent") || config.defaultAgentId() || org.defaultAgentId || "";
  if (isLoading) return <LoadingScreen />;
  if (!mentorId)
    return (
      <BuiltInCoach
        notice={
          <p className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900">
            No agent is set up for this app yet, so the built-in Coach is answering from your wallet.{" "}
            {isAdmin ? (
              <Link href="/setup" className="underline">
                Pick or create an agent
              </Link>
            ) : (
              "Ask an admin to finish setup for an AI coach."
            )}
          </p>
        }
      />
    );
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AgentChat mentorId={mentorId} />
    </div>
  );
}

type Turn = { role: "user" | "coach"; text: string; promptId?: string };

function BuiltInCoach({ notice }: { notice?: React.ReactNode }) {
  const { state } = useWallet();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [q, setQ] = useState("");
  const [origin, setOrigin] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns]);

  if (state.isLoading) return <LoadingScreen />;

  const ask = (promptId: string, label: string) => {
    const org = config.demoMode() ? "demo-wallet" : resolveAppTenant();
    const verifyQuery = `?org=${encodeURIComponent(org)}&u=${encodeURIComponent(state.profile.username)}`;
    setTurns((t) => [...t, { role: "user", text: label }, { role: "coach", text: coachAnswer(promptId, state, origin, verifyQuery), promptId }]);
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    ask(routeQuestion(q), q.trim());
    setQ("");
  };
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied");
    } catch {
      toast.error("Clipboard unavailable");
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader icon={<Sparkles />} title="Coach" description="Answers written from your wallet — résumé lines, gaps, what to send, what to say." />
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Page>
            {notice}
            {!turns.length ? (
              <div className="mx-auto max-w-2xl">
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-[var(--border-color,#e5e7eb)] bg-white p-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00b0ef] to-[#0058cc] text-white">
                    <Bot className="size-5" />
                  </span>
                  <div className="text-sm text-gray-700">
                    <p className="font-medium text-gray-900">Hi {state.profile.name.split(" ")[0]}. I read your wallet, not the internet.</p>
                    <p className="mt-1">Everything I say comes from your credentials, skills, education and experience, plus the role library. Pick a prompt or type a question.</p>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {COACH_PROMPTS.map((p) => (
                    <button key={p.id} type="button" onClick={() => ask(p.id, p.label)} className="rounded-lg border border-gray-200 bg-white p-3 text-left hover:border-[#0058cc]/50">
                      <span className="block text-sm font-medium text-gray-900">{p.label}</span>
                      <span className="block text-xs text-muted-foreground">{p.hint}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-2xl space-y-4">
                {turns.map((t, i) => (
                  <div key={i} className={cn("flex", t.role === "user" ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[90%] rounded-2xl px-4 py-3 text-sm", t.role === "user" ? "bg-[#0058cc] text-white" : "border border-[var(--border-color,#e5e7eb)] bg-white text-gray-800")}>
                      {t.role === "coach" ? (
                        <div className="prose prose-sm max-w-none [&_a]:text-[#0058cc] [&_blockquote]:border-l-2 [&_blockquote]:border-[#0058cc] [&_blockquote]:pl-3 [&_li]:my-0.5 [&_p]:my-1.5 [&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5">
                          <Markdown>{t.text}</Markdown>
                        </div>
                      ) : (
                        t.text
                      )}
                      {t.role === "coach" ? (
                        <div className="mt-2 flex gap-1">
                          <Button size="xs" variant="ghost" onClick={() => copy(t.text)}>
                            <Copy /> Copy
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {COACH_PROMPTS.map((p) => (
                    <button key={p.id} type="button" onClick={() => ask(p.id, p.label)} className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700 hover:border-[#0058cc]/50">
                      {p.label}
                    </button>
                  ))}
                </div>
                <div ref={endRef} />
              </div>
            )}
          </Page>
        </div>
        <form onSubmit={submit} className="shrink-0 border-t border-[var(--border-color,#e5e7eb)] bg-white px-4 py-3">
          <div className="mx-auto flex max-w-2xl gap-2">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask about your résumé, gaps, what to send…" aria-label="Ask the Coach" />
            <Button type="submit" className="ibl-button-primary" disabled={!q.trim()}>
              <Send /> Ask
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
