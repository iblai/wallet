"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Briefcase, GraduationCap, Pencil, Plus, Trash2, UserRound, Plug } from "lucide-react";
import { Profile } from "@iblai/iblai-js/web-containers";
import config from "@/lib/iblai/config";
import { resolveAppTenant } from "@/lib/iblai/tenant";
import { useWallet } from "@/lib/wallet/provider";
import { newId, type WalletEducation, type WalletExperience } from "@/lib/wallet/types";
import { AppPreferences } from "@/components/settings/app-preferences";
import { Page, Section } from "@/components/wallet/section";
import { PageHeader } from "@/components/page-header";
import { LoadingScreen } from "@/components/loading-screen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/**
 * Signed in: the SDK's full Profile (Basic, Social, Education with its
 * Credentials and Skills sub-tabs, Experience with Résumé upload, Memory,
 * History, Usage, Privacy, Security) — the same surface as os.ibl.ai, and
 * the career records it edits are what the wallet reads.
 *
 * Demo: the same records (identity, education, experience) edited here,
 * kept in the browser.
 */
export default function ProfilePage() {
  return config.demoMode() ? <DemoProfile /> : <PlatformProfile />;
}

function PlatformProfile() {
  const [tenantKey, setTenantKey] = useState("");
  const [username, setUsername] = useState("");
  const [tenants, setTenants] = useState<any[]>([]);
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
        const parsed = JSON.parse(tenantsRaw);
        setTenants(parsed);
        const match = parsed.find((t: any) => t.key === resolved);
        if (match) setIsAdmin(!!match.is_admin);
      }
    } catch {}
    setReady(true);
  }, []);

  if (!ready || !tenantKey) return <LoadingScreen />;

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 overflow-auto px-4 py-5 md:px-6">
      <div className="min-h-[640px] overflow-hidden rounded-lg border border-[var(--border-color)] bg-white">
        <Profile
          tenant={tenantKey}
          tenants={tenants}
          username={username}
          isAdmin={isAdmin}
          onClose={() => {}}
          customization={{ showPlatformName: true, useGravatarPicFallback: true }}
          targetTab="education"
        />
      </div>
      <div className="mt-6">
        <AppPreferences />
      </div>
    </div>
  );
}

const fmt = (d?: string) => (d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short" }) : "");

function DemoProfile() {
  const { state, actions } = useWallet();
  const p = state.profile;
  const [form, setForm] = useState({ name: p.name, headline: p.headline ?? "", location: p.location ?? "", email: p.email ?? "", about: p.about ?? "" });
  const [edu, setEdu] = useState<WalletEducation | null>(null);
  const [exp, setExp] = useState<WalletExperience | null>(null);
  useEffect(() => {
    setForm({ name: p.name, headline: p.headline ?? "", location: p.location ?? "", email: p.email ?? "", about: p.about ?? "" });
  }, [p.name, p.headline, p.location, p.email, p.about]);

  if (state.isLoading) return <LoadingScreen />;

  const save = async (fn: () => Promise<void>, msg = "Saved") => {
    try {
      await fn();
      toast.success(msg);
    } catch {
      toast.error("Could not save");
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader icon={<UserRound />} title="Profile" description="Who the wallet belongs to, and the education and experience that sit beside the credentials." />
      <Page>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <Section title="Basic" description="Shown on the public wallet page and the résumé.">
              <form
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  void save(() => actions.updateProfile(form), "Profile saved");
                }}
              >
                <Field label="Full name">
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </Field>
                <Field label="Email">
                  <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" />
                </Field>
                <Field label="Headline">
                  <Input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="Data analyst moving toward data science" />
                </Field>
                <Field label="Location">
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </Field>
                <Field label="About" className="sm:col-span-2">
                  <Textarea value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} rows={3} />
                </Field>
                <div className="sm:col-span-2">
                  <Button type="submit" className="ibl-button-primary">
                    Save
                  </Button>
                </div>
              </form>
            </Section>

            <Section
              title={
                <span className="inline-flex items-center gap-2">
                  <GraduationCap className="size-4 text-[#0058cc]" /> Education
                </span>
              }
              actions={
                <Button variant="outline" size="sm" onClick={() => setEdu({ id: newId("edu"), institution: "" })}>
                  <Plus /> Add
                </Button>
              }
            >
              <RecordList
                rows={state.education.map((e) => ({ id: e.id, title: [e.degree, e.fieldOfStudy].filter(Boolean).join(", ") || e.institution, subtitle: e.degree || e.fieldOfStudy ? e.institution : "", meta: [fmt(e.startDate), e.current ? "Present" : fmt(e.endDate)].filter(Boolean).join(" – ") }))}
                onEdit={(id) => setEdu(state.education.find((e) => e.id === id) ?? null)}
                onRemove={(id) => void save(() => actions.removeEducation(id), "Removed")}
                empty="No education on record."
              />
            </Section>

            <Section
              title={
                <span className="inline-flex items-center gap-2">
                  <Briefcase className="size-4 text-[#0058cc]" /> Experience
                </span>
              }
              actions={
                <Button variant="outline" size="sm" onClick={() => setExp({ id: newId("exp"), company: "", title: "" })}>
                  <Plus /> Add
                </Button>
              }
            >
              <RecordList
                rows={state.experience.map((e) => ({ id: e.id, title: e.title, subtitle: [e.company, e.location].filter(Boolean).join(" · "), meta: [fmt(e.startDate), e.current ? "Present" : fmt(e.endDate)].filter(Boolean).join(" – ") }))}
                onEdit={(id) => setExp(state.experience.find((e) => e.id === id) ?? null)}
                onRemove={(id) => void save(() => actions.removeExperience(id), "Removed")}
                empty="No experience on record."
              />
            </Section>
          </div>

          <div className="space-y-5">
            <Section
              id="connect"
              title={
                <span className="inline-flex items-center gap-2">
                  <Plug className="size-4 text-[#0058cc]" /> Connect ibl.ai
                </span>
              }
              description="Swap the sample wallet for your own organization."
            >
              <ol className="list-decimal space-y-2 pl-4 text-sm break-words text-gray-700 [&_code]:break-all">
                <li>
                  Org key from <a className="text-[#0058cc] underline" href="https://login.iblai.app/me" target="_blank" rel="noreferrer">login.iblai.app/me</a> (new: <a className="text-[#0058cc] underline" href="https://ibl.ai/join" target="_blank" rel="noreferrer">ibl.ai/join</a>).
                </li>
                <li>A Platform API Token (OS → Admin → Integrations → APIs).</li>
                <li>
                  In <code className="rounded bg-gray-100 px-1">.env.local</code>: <code className="rounded bg-gray-100 px-1">NEXT_PUBLIC_WALLET_DEMO=false</code>, <code className="rounded bg-gray-100 px-1">NEXT_PUBLIC_MAIN_TENANT_KEY</code>, <code className="rounded bg-gray-100 px-1">IBLAI_API_KEY</code>; restart.
                </li>
                <li>Allow <code className="rounded bg-gray-100 px-1">http://localhost:3000</code> in the org's redirect origins.</li>
              </ol>
              <p className="mt-3 text-xs text-muted-foreground">Signed in, this page becomes the full ibl.ai profile: education, experience, résumé upload, memory, history, privacy and security.</p>
            </Section>
            <Section title="Sample data">
              <p className="text-sm text-gray-700">Edits on this demo stay in this browser.</p>
              <Button variant="outline" className="mt-3" onClick={() => actions.resetDemo()}>
                Reset sample wallet
              </Button>
            </Section>
          </div>
        </div>
      </Page>

      <Dialog open={!!edu} onOpenChange={(o) => !o && setEdu(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Education</DialogTitle>
          </DialogHeader>
          {edu ? (
            <form
              className="grid gap-3 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                void save(() => actions.saveEducation(edu)).then(() => setEdu(null));
              }}
            >
              <Field label="Institution *" className="sm:col-span-2">
                <Input value={edu.institution} onChange={(e) => setEdu({ ...edu, institution: e.target.value })} required />
              </Field>
              <Field label="Degree">
                <Input value={edu.degree ?? ""} onChange={(e) => setEdu({ ...edu, degree: e.target.value })} placeholder="B.S." />
              </Field>
              <Field label="Field of study">
                <Input value={edu.fieldOfStudy ?? ""} onChange={(e) => setEdu({ ...edu, fieldOfStudy: e.target.value })} />
              </Field>
              <Field label="Start">
                <Input type="date" value={edu.startDate ?? ""} onChange={(e) => setEdu({ ...edu, startDate: e.target.value })} />
              </Field>
              <Field label="End">
                <Input type="date" value={edu.endDate ?? ""} onChange={(e) => setEdu({ ...edu, endDate: e.target.value })} disabled={!!edu.current} />
              </Field>
              <div className="flex items-center gap-2 text-sm sm:col-span-2">
                <Switch id="edu-current" checked={!!edu.current} onCheckedChange={(on: boolean) => setEdu({ ...edu, current: on })} />
                <Label htmlFor="edu-current">Currently enrolled</Label>
              </div>
              <Field label="Notes" className="sm:col-span-2">
                <Textarea value={edu.description ?? ""} onChange={(e) => setEdu({ ...edu, description: e.target.value })} rows={2} />
              </Field>
              <div className="flex justify-end gap-2 sm:col-span-2">
                <Button type="button" variant="outline" onClick={() => setEdu(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="ibl-button-primary">
                  Save
                </Button>
              </div>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={!!exp} onOpenChange={(o) => !o && setExp(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Experience</DialogTitle>
          </DialogHeader>
          {exp ? (
            <form
              className="grid gap-3 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                void save(() => actions.saveExperience(exp)).then(() => setExp(null));
              }}
            >
              <Field label="Title *">
                <Input value={exp.title} onChange={(e) => setExp({ ...exp, title: e.target.value })} required />
              </Field>
              <Field label="Company *">
                <Input value={exp.company} onChange={(e) => setExp({ ...exp, company: e.target.value })} required />
              </Field>
              <Field label="Location">
                <Input value={exp.location ?? ""} onChange={(e) => setExp({ ...exp, location: e.target.value })} />
              </Field>
              <Field label="Employment type">
                <Input value={exp.employmentType ?? ""} onChange={(e) => setExp({ ...exp, employmentType: e.target.value })} placeholder="Full-time" />
              </Field>
              <Field label="Start">
                <Input type="date" value={exp.startDate ?? ""} onChange={(e) => setExp({ ...exp, startDate: e.target.value })} />
              </Field>
              <Field label="End">
                <Input type="date" value={exp.endDate ?? ""} onChange={(e) => setExp({ ...exp, endDate: e.target.value })} disabled={!!exp.current} />
              </Field>
              <div className="flex items-center gap-2 text-sm sm:col-span-2">
                <Switch id="exp-current" checked={!!exp.current} onCheckedChange={(on: boolean) => setExp({ ...exp, current: on })} />
                <Label htmlFor="exp-current">I work here now</Label>
              </div>
              <Field label="What you did (one bullet per line)" className="sm:col-span-2">
                <Textarea value={exp.description ?? ""} onChange={(e) => setExp({ ...exp, description: e.target.value })} rows={4} />
              </Field>
              <div className="flex justify-end gap-2 sm:col-span-2">
                <Button type="button" variant="outline" onClick={() => setExp(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="ibl-button-primary">
                  Save
                </Button>
              </div>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-gray-700">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function RecordList({ rows, onEdit, onRemove, empty }: { rows: { id: string; title: string; subtitle?: string; meta?: string }[]; onEdit: (id: string) => void; onRemove: (id: string) => void; empty: string }) {
  if (!rows.length) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <ul className="divide-y divide-gray-100">
      {rows.map((r) => (
        <li key={r.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900">{r.title}</p>
            {r.subtitle ? <p className="text-xs text-gray-600">{r.subtitle}</p> : null}
            {r.meta ? <p className="text-xs text-muted-foreground">{r.meta}</p> : null}
          </div>
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => onEdit(r.id)}>
              <Pencil />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Remove" onClick={() => onRemove(r.id)}>
              <Trash2 />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
