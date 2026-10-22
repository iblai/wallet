"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { BadgeCheck, Plus, Target, TrendingUp } from "lucide-react";
import { useWallet } from "@/lib/wallet/provider";
import { fmtUsd, gapAnalysis, rankRoles, roleById, ROLES, searchSkills } from "@/lib/wallet/market";
import type { WalletSkill } from "@/lib/wallet/types";
import { Page, Section, StatTile } from "@/components/wallet/section";
import { PageHeader } from "@/components/page-header";
import { SkillChip } from "@/components/wallet/badges";
import { LoadingScreen } from "@/components/loading-screen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * The skills profile: what the wallet can evidence (from credentials and
 * platform skill points), what the user self-reports, what they want — and
 * the distance to a target role, with market context. This is the WGU
 * Achievement Wallet's "skills → jobs" view and Credly's "labor market
 * insights", on the learner's own data.
 */
export default function SkillsPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Skills />
    </Suspense>
  );
}

function Skills() {
  const { state, actions } = useWallet();
  const params = useSearchParams();
  const [addOpen, setAddOpen] = useState<"self" | "desired" | null>(null);

  // `?role=` previews a role without changing the saved target.
  const previewRole = roleById(params.get("role") ?? undefined);
  const target = roleById(state.settings.targetRoleId);
  const role = previewRole ?? target;
  const gap = useMemo(() => (role ? gapAnalysis(role, state.skills) : null), [role, state.skills]);
  const ranked = useMemo(() => rankRoles(state.skills).slice(0, 6), [state.skills]);

  if (state.isLoading) return <LoadingScreen />;

  const evidenced = state.skills.filter((s) => s.origin === "credential" || s.origin === "platform");
  const self = state.skills.filter((s) => s.origin === "self");
  const desired = state.skills.filter((s) => s.origin === "desired");

  const setTarget = async (id: string) => {
    try {
      await actions.setTargetRole(id);
      toast.success(id ? `Target set: ${roleById(id)?.title}` : "Target cleared");
    } catch {
      toast.error("Could not save");
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        icon={<TrendingUp />}
        title="Skills"
        count={evidenced.length + self.length}
        description="What your credentials prove, what you report, and the distance to the job you want."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setAddOpen("self")}>
              <Plus /> Self-report a skill
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAddOpen("desired")}>
              <Target /> Add a goal
            </Button>
          </>
        }
      />
      <Page>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile label="Evidenced skills" value={evidenced.length} hint="attested by credentials or platform points" tone="good" />
          <StatTile label="Self-reported" value={self.length} hint="rated by you, labeled as such" />
          <StatTile label="Skill points" value={state.skillPoints ? state.skillPoints.total.toLocaleString() : "—"} hint={state.skillPoints?.percentile ? `top ${100 - state.skillPoints.percentile}% in your organization` : "earned on ibl.ai courses"} />
        </div>

        <Section
          className="mt-5"
          title={
            <span className="inline-flex items-center gap-2">
              <Target className="size-4 text-[#0058cc]" /> Target role
            </span>
          }
          description="Pick the job you are working toward. The gap analysis weights core skills more than nice-to-haves."
          actions={
            <Select value={target?.id ?? ""} onValueChange={(v) => void setTarget(String(v ?? ""))} items={ROLES.map((r) => ({ value: r.id, label: r.title }))}>
              <SelectTrigger size="sm" className="w-56" aria-label="Target role">
                <SelectValue placeholder="Choose a role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        >
          {role && gap ? (
            <div>
              {previewRole && previewRole.id !== target?.id ? (
                <p className="mb-3 rounded-lg bg-[#eef6fc] px-3 py-2 text-xs text-[#0058cc]">
                  Previewing <strong>{previewRole.title}</strong>.{" "}
                  <button type="button" className="underline" onClick={() => void setTarget(previewRole.id)}>
                    Make it my target
                  </button>
                </p>
              ) : null}
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{role.title}</h3>
                  <p className="text-sm text-gray-600">{role.summary}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-semibold text-gray-900">{gap.coverage}%</div>
                  <div className="text-xs text-muted-foreground">of the weighted skill set evidenced</div>
                </div>
              </div>
              <Progress value={gap.coverage} className="mt-3" />

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">You have ({gap.matched.length})</p>
                  <ul className="space-y-1.5">
                    {gap.matched.map((m) => (
                      <li key={m.skill} className="flex items-center justify-between gap-2 text-sm">
                        <span className="inline-flex items-center gap-1.5 text-gray-900">
                          <BadgeCheck className="size-4 text-emerald-600" /> {m.skill}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {m.evidence.length ? `${m.evidence.length} credential${m.evidence.length === 1 ? "" : "s"}` : "self-reported"}
                        </span>
                      </li>
                    ))}
                    {!gap.matched.length ? <li className="text-sm text-muted-foreground">Nothing evidenced yet.</li> : null}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Gaps ({gap.gaps.length})</p>
                  <ul className="space-y-2">
                    {gap.gaps.map((g) => (
                      <li key={g.skill} className="rounded-lg border border-gray-200 p-2.5 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-gray-900">{g.skill}</span>
                          <span className={cn("rounded-full px-2 py-px text-[11px] font-medium", g.weight === 3 ? "bg-red-50 text-red-700" : g.weight === 2 ? "bg-amber-50 text-amber-800" : "bg-gray-100 text-gray-600")}>
                            {g.weight === 3 ? "core" : g.weight === 2 ? "expected" : "nice to have"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Typically: {g.suggestions.join(" · ")}</p>
                      </li>
                    ))}
                    {!gap.gaps.length ? <li className="text-sm text-emerald-700">No gaps against this role.</li> : null}
                  </ul>
                </div>
              </div>

              <div className="mt-5 grid gap-3 rounded-lg bg-[#fafbfc] p-4 sm:grid-cols-4">
                <div>
                  <div className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Median pay</div>
                  <div className="text-lg font-semibold text-gray-900">{fmtUsd(role.market.medianSalaryUsd)}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Range</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {fmtUsd(role.market.salaryRangeUsd[0])}–{fmtUsd(role.market.salaryRangeUsd[1])}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">10-yr growth</div>
                  <div className="text-lg font-semibold text-gray-900">{role.market.growthPct}%</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Demand</div>
                  <div className="text-lg font-semibold text-gray-900 capitalize">{role.market.demand}</div>
                </div>
                <p className="text-xs text-muted-foreground sm:col-span-4">
                  Illustrative US figures bundled with the app (lib/wallet/market.ts). Typical credentials for this role: {role.market.typicalCredentials.join(", ")}.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {ranked.map((g) => (
                <button key={g.role.id} type="button" onClick={() => void setTarget(g.role.id)} className="rounded-lg border border-gray-200 p-3 text-left hover:border-[#0058cc]/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">{g.role.title}</span>
                    <span className="text-sm font-semibold text-[#0058cc]">{g.coverage}%</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{g.role.family} · median {fmtUsd(g.role.market.medianSalaryUsd)}</p>
                </button>
              ))}
            </div>
          )}
        </Section>

        {role ? (
          <Section className="mt-5" title="Other roles you already fit" description="Ranked by evidenced coverage. Click to preview.">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {ranked
                .filter((g) => g.role.id !== role.id)
                .slice(0, 5)
                .map((g) => (
                  <Link key={g.role.id} href={`/skills?role=${g.role.id}`} className="rounded-lg border border-gray-200 p-3 hover:border-[#0058cc]/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{g.role.title}</span>
                      <span className="text-sm font-semibold text-[#0058cc]">{g.coverage}%</span>
                    </div>
                  </Link>
                ))}
            </div>
          </Section>
        ) : null}

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <Section title="Evidenced" description="From accepted credentials and ibl.ai skill points.">
            <SkillList skills={evidenced} />
          </Section>
          <Section
            title="Self-reported"
            description="Rated by you, 1–5. Employers see the label."
            actions={
              <Button variant="ghost" size="sm" onClick={() => setAddOpen("self")}>
                <Plus /> Add
              </Button>
            }
          >
            <SkillList skills={self} onRemove={(n) => void actions.removeSelfSkill(n)} />
          </Section>
          <Section
            title="Goals"
            description="Skills you want next. They never count as held."
            actions={
              <Button variant="ghost" size="sm" onClick={() => setAddOpen("desired")}>
                <Plus /> Add
              </Button>
            }
          >
            <SkillList skills={desired} onRemove={(n) => void actions.removeDesiredSkill(n)} />
          </Section>
        </div>
      </Page>

      <AddSkillDialog
        mode={addOpen}
        onClose={() => setAddOpen(null)}
        onAdd={async (name, level) => {
          if (addOpen === "self") await actions.addSelfSkill(name, level);
          else await actions.addDesiredSkill(name);
          toast.success(`${name} added`);
        }}
      />
    </div>
  );
}

function SkillList({ skills, onRemove }: { skills: WalletSkill[]; onRemove?: (name: string) => void }) {
  if (!skills.length) return <p className="text-sm text-muted-foreground">Nothing here yet.</p>;
  return (
    <ul className="space-y-2">
      {skills.map((s) => (
        <li key={s.name} className="flex items-center justify-between gap-2 text-sm">
          <span className="min-w-0">
            <span className="font-medium text-gray-900">{s.name}</span>
            <span className="block text-xs text-muted-foreground">
              {s.evidence.length ? `${s.evidence.length} credential${s.evidence.length === 1 ? "" : "s"}` : ""}
              {s.points ? `${s.evidence.length ? " · " : ""}${s.points} pts` : ""}
              {s.level ? `${s.evidence.length || s.points ? " · " : ""}${"★".repeat(s.level)}${"☆".repeat(5 - s.level)}` : ""}
              {s.origin === "desired" ? "goal" : ""}
            </span>
          </span>
          {onRemove ? (
            <button type="button" onClick={() => onRemove(s.name)} className="text-xs text-muted-foreground hover:text-red-600">
              Remove
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function AddSkillDialog({ mode, onClose, onAdd }: { mode: "self" | "desired" | null; onClose: () => void; onAdd: (name: string, level: number) => Promise<void> }) {
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState("");
  const [level, setLevel] = useState(3);
  const results = useMemo(() => searchSkills(q, 10), [q]);
  useEffect(() => {
    if (!mode) {
      setQ("");
      setPicked("");
      setLevel(3);
    }
  }, [mode]);
  const name = picked || q.trim();
  return (
    <Dialog open={!!mode} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "self" ? "Self-report a skill" : "Add a skill goal"}</DialogTitle>
          <DialogDescription>{mode === "self" ? "Search the taxonomy or type your own. Self-reported skills stay labeled as such." : "A goal shows what you are working toward and feeds the Coach."}</DialogDescription>
        </DialogHeader>
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPicked("");
          }}
          placeholder="Search skills…"
          aria-label="Search skills"
        />
        <div className="flex flex-wrap gap-1.5">
          {results.map((r) => (
            <button key={r} type="button" onClick={() => setPicked(r)} className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", picked === r ? "border-[#0058cc] bg-[#eef6fc] text-[#0058cc]" : "border-gray-200 text-gray-700 hover:bg-gray-50")}>
              {r}
            </button>
          ))}
        </div>
        {mode === "self" ? (
          <div>
            <p className="mb-1 text-xs text-muted-foreground">Your level</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" aria-label={`Level ${n}`} onClick={() => setLevel(n)} className={cn("size-8 rounded-lg border text-sm", n <= level ? "border-[#0058cc] bg-[#eef6fc] text-[#0058cc]" : "border-gray-200 text-gray-500")}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="ibl-button-primary"
            disabled={!name}
            onClick={async () => {
              await onAdd(name, level);
              onClose();
            }}
          >
            Add {name ? <SkillChip name={name} className="bg-white" /> : null}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
