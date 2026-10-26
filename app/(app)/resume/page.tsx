"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Download, FileText, Printer, RotateCcw, Sparkles } from "lucide-react";
import { useWallet } from "@/lib/wallet/provider";
import { resolveAppTenant } from "@/lib/iblai/tenant";
import config from "@/lib/iblai/config";
import { complete } from "@/lib/iblai/completions";
import {
  autoSummary,
  buildResume,
  featuredCredentials,
  resumeToMarkdown,
  resumeToText,
  summaryPrompt,
  type ResumeDoc,
} from "@/lib/wallet/resume";
import { credentialStatus } from "@/lib/wallet/types";
import { Page, Section } from "@/components/wallet/section";
import { PageHeader } from "@/components/page-header";
import { LoadingScreen } from "@/components/loading-screen";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * The résumé the wallet writes. Left: choices (template, summary, sections,
 * which credentials to feature). Right: the document, printable as-is. The
 * verify links in the credentials section are the point — a reader clicks
 * through to the issuer's confirmation instead of trusting a line of text.
 */
const TEMPLATES = [
  { value: "classic", label: "Classic — serif headings" },
  { value: "modern", label: "Modern — brand accent" },
  { value: "compact", label: "Compact — one page" },
];

export default function ResumePage() {
  const { state, actions } = useWallet();
  // One object per settings value, so the memos below see a stable dependency.
  const prefs = useMemo(() => state.settings.resume ?? {}, [state.settings.resume]);
  const [summary, setSummary] = useState(prefs.summary ?? "");
  const [drafting, setDrafting] = useState(false);
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  useEffect(() => {
    setSummary(prefs.summary ?? "");
  }, [prefs.summary]);

  const org = config.demoMode() ? "demo-wallet" : resolveAppTenant();
  const doc = useMemo(
    () =>
      buildResume(
        { ...state, settings: { ...state.settings, resume: { ...prefs, summary } } },
        origin,
        org,
      ),
    [state, prefs, summary, origin, org],
  );
  const active = state.credentials.filter((c) => credentialStatus(c) === "active");
  const featured = featuredCredentials(state, prefs).map((c) => c.id);

  if (state.isLoading) return <LoadingScreen />;

  const sections = prefs.sections ?? {
    skills: true,
    credentials: true,
    education: true,
    experience: true,
  };
  const save = async (patch: Parameters<typeof actions.setResumePrefs>[0], msg = "Saved") => {
    try {
      await actions.setResumePrefs(patch);
      toast.success(msg);
    } catch {
      toast.error("Could not save");
    }
  };
  const download = (name: string, text: string, type: string) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied");
    } catch {
      toast.error("Clipboard unavailable");
    }
  };
  const draft = async () => {
    setDrafting(true);
    try {
      setSummary(await complete(org, state.profile.username, summaryPrompt(state)));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not draft a summary");
    } finally {
      setDrafting(false);
    }
  };
  const slug = state.profile.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        icon={<FileText />}
        title="Résumé"
        description="Written from your wallet; every credential line links to its verification."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => copy(resumeToText(doc))}>
              <Copy /> Copy text
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => download(`${slug}-resume.md`, resumeToMarkdown(doc), "text/markdown")}
            >
              <Download /> Markdown
            </Button>
            <Button size="sm" className="ibl-button-primary" onClick={() => window.print()}>
              <Printer /> Print / PDF
            </Button>
          </>
        }
      />
      <Page wide>
        <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-5 print:hidden">
            <Section
              title="Summary"
              description={
                state.isDemo
                  ? "Two or three sentences at the top."
                  : "Two or three sentences at the top; Draft for me writes one from your record with your platform's AI."
              }
            >
              <Textarea
                id="resume-summary"
                aria-label="Summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={5}
                placeholder={autoSummary(state)}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {!state.isDemo ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={drafting}
                    onClick={() => void draft()}
                  >
                    <Sparkles /> {drafting ? "Drafting…" : "Draft for me"}
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  className="ibl-button-primary"
                  disabled={summary === (prefs.summary ?? "")}
                  onClick={() => save({ summary }, "Summary saved")}
                >
                  Save
                </Button>
                {summary ? (
                  <Button size="sm" variant="ghost" onClick={() => setSummary("")}>
                    <RotateCcw /> Clear
                  </Button>
                ) : null}
              </div>
            </Section>

            <Section title="Layout">
              <Label>Template</Label>
              <Select
                value={prefs.template ?? "classic"}
                onValueChange={(v) =>
                  void save({ template: (v as "classic" | "modern" | "compact") ?? "classic" })
                }
                items={TEMPLATES}
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classic">Classic — serif headings</SelectItem>
                  <SelectItem value="modern">Modern — brand accent</SelectItem>
                  <SelectItem value="compact">Compact — one page</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-4 space-y-3">
                {(["experience", "credentials", "education", "skills"] as const).map((k) => (
                  <div key={k} className="flex items-center justify-between text-sm">
                    <Label htmlFor={`sec-${k}`} className="capitalize">
                      {k === "credentials" ? "Licenses & certifications" : k}
                    </Label>
                    <Switch
                      id={`sec-${k}`}
                      checked={sections[k]}
                      onCheckedChange={(on: boolean) =>
                        void save({ sections: { ...sections, [k]: on } })
                      }
                    />
                  </div>
                ))}
              </div>
            </Section>

            <Section
              title="Featured credentials"
              description="Untick the ones a given application does not need. Leaving all ticked features everything active."
            >
              <ul className="space-y-2">
                {active.map((c) => (
                  <li key={c.id}>
                    <label htmlFor={`featured-${c.id}`} className="flex items-start gap-2 text-sm">
                      <Checkbox
                        id={`featured-${c.id}`}
                        checked={featured.includes(c.id)}
                        onCheckedChange={(on) => {
                          const next = on
                            ? [...new Set([...featured, c.id])]
                            : featured.filter((x) => x !== c.id);
                          void save({
                            featuredCredentialIds: next.length === active.length ? [] : next,
                          });
                        }}
                      />
                      <span>
                        <span className="font-medium text-gray-900">{c.name}</span>
                        <span className="text-muted-foreground block text-xs">{c.issuer.name}</span>
                      </span>
                    </label>
                  </li>
                ))}
                {!active.length ? (
                  <li className="text-muted-foreground text-sm">
                    No active credentials to feature.
                  </li>
                ) : null}
              </ul>
            </Section>

            {state.resumeFileUrl ? (
              <Section title="Uploaded résumé" description="The PDF on your ibl.ai profile.">
                <a
                  href={state.resumeFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-[#0058cc] hover:underline"
                >
                  Open uploaded PDF
                </a>
              </Section>
            ) : null}
          </div>

          <ResumeView doc={doc} template={prefs.template ?? "classic"} />
        </div>
      </Page>
    </div>
  );
}

function ResumeView({
  doc,
  template,
}: {
  doc: ResumeDoc;
  template: "classic" | "modern" | "compact";
}) {
  const compact = template === "compact";
  const modern = template === "modern";
  return (
    <article
      id="resume-print"
      className={cn(
        "min-w-0 overflow-hidden rounded-lg border border-[var(--border-color,#e5e7eb)] bg-white p-8 text-gray-900 shadow-sm print:border-0 print:p-0 print:shadow-none",
        compact ? "text-[13px] leading-snug" : "text-sm leading-relaxed",
      )}
    >
      <header className={cn("border-b pb-4", modern ? "border-[#0058cc]" : "border-gray-300")}>
        <h1
          className={cn(
            "font-semibold",
            compact ? "text-xl" : "text-2xl",
            modern ? "text-[#0058cc]" : "font-serif text-gray-900",
          )}
        >
          {doc.name}
        </h1>
        {doc.headline ? <p className="text-gray-700">{doc.headline}</p> : null}
        {doc.contact.length ? (
          <p className="mt-1 text-xs text-gray-500">{doc.contact.join(" · ")}</p>
        ) : null}
      </header>
      {doc.sections.map((s) => (
        <section key={s.id} className={compact ? "mt-3" : "mt-5"}>
          <h2
            className={cn(
              "mb-2 text-[11px] font-semibold tracking-[0.12em] uppercase",
              modern ? "text-[#0058cc]" : "text-gray-500",
            )}
          >
            {s.title}
          </h2>
          {s.id === "summary" ? (
            <p className="text-gray-800">{s.items[0]?.title}</p>
          ) : s.id === "skills" ? (
            <p className="text-gray-800">{s.items[0]?.tags?.join(" · ")}</p>
          ) : (
            <ul className={compact ? "space-y-2" : "space-y-3"}>
              {s.items.map((it, i) => (
                <li key={i}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="font-semibold text-gray-900">
                      {it.title}
                      {it.subtitle ? (
                        <span className="font-normal text-gray-700"> — {it.subtitle}</span>
                      ) : null}
                    </span>
                    {it.meta ? <span className="text-xs text-gray-500">{it.meta}</span> : null}
                  </div>
                  {it.bullets?.length ? (
                    <ul className="mt-1 list-disc space-y-0.5 pl-5 text-gray-800">
                      {it.bullets.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  ) : null}
                  {it.tags?.length ? (
                    <p className="mt-0.5 text-xs text-gray-500">Skills: {it.tags.join(", ")}</p>
                  ) : null}
                  {it.href ? (
                    <a
                      href={it.href}
                      className="block max-w-full truncate text-xs text-[#0058cc] underline-offset-2 hover:underline print:break-all print:whitespace-normal print:text-gray-500"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {it.href}
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #resume-print,
          #resume-print * {
            visibility: visible;
          }
          #resume-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </article>
  );
}
