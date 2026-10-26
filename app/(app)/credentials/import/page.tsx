"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, FileJson, Link2, PenLine, Plug, Sparkles } from "lucide-react";
import { useWallet } from "@/lib/wallet/provider";
import {
  OpenBadgeParseError,
  parseOpenBadge,
  guessKind,
  credlyJsonCandidates,
} from "@/lib/wallet/open-badges";
import { SAMPLE_OB2_ASSERTION, SAMPLE_OB3_CREDENTIAL } from "@/lib/wallet/demo-data";
import { newId, type CredentialKind, type WalletCredential } from "@/lib/wallet/types";
import { CredentialCard } from "@/components/wallet/credential-card";
import { KIND_LABEL } from "@/components/wallet/badges";
import { Page, Section } from "@/components/wallet/section";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { readTenants } from "@/lib/iblai/tenant";
import { platformRows } from "@/lib/wallet/derive";

/**
 * Three ways in, all ending in the same `WalletCredential`:
 *  1. A badge URL (Credly page, Badgr, any hosted Open Badge) — fetched by
 *     the browser when the issuer allows it (CORS), otherwise paste the JSON.
 *  2. Pasted JSON — Open Badges 2.0 assertion or 3.0 credential.
 *  3. A record you hold on paper — typed in, labeled self-reported.
 * Credentials issued on any of the user's platforms never need importing: they appear live.
 */
export default function ImportPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        icon={<FileJson />}
        title="Add a credential"
        description="From a badge link, badge JSON, or your own records."
      />
      <Page>
        <Link
          href="/credentials"
          className="text-muted-foreground inline-flex items-center gap-1 text-sm hover:text-[#0058cc]"
        >
          <ArrowLeft className="size-4" /> Credentials
        </Link>
        <Tabs defaultValue="url" className="mt-3">
          <TabsList className="max-w-full overflow-x-auto overflow-y-hidden">
            <TabsTrigger value="url">
              <Link2 /> Badge link
            </TabsTrigger>
            <TabsTrigger value="json">
              <FileJson /> Paste JSON
            </TabsTrigger>
            <TabsTrigger value="manual">
              <PenLine /> Add manually
            </TabsTrigger>
            <TabsTrigger value="platform">
              <Plug /> Your platforms
            </TabsTrigger>
          </TabsList>
          <TabsContent value="url">
            <FromUrl />
          </TabsContent>
          <TabsContent value="json">
            <FromJson />
          </TabsContent>
          <TabsContent value="manual">
            <Manual />
          </TabsContent>
          <TabsContent value="platform">
            <FromPlatform />
          </TabsContent>
        </Tabs>
      </Page>
    </div>
  );
}

function Preview({
  credential,
  onSave,
  saving,
}: {
  credential: WalletCredential;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
      <p className="mb-3 text-sm font-medium text-emerald-900">
        Recognized. This is what will be added:
      </p>
      <CredentialCard credential={credential} />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button className="ibl-button-primary" onClick={onSave} disabled={saving}>
          {saving ? "Adding…" : "Add to wallet"}
        </Button>
        <span className="text-muted-foreground text-xs">
          It arrives as "awaiting acceptance" — accept it on its page to make it count.
        </span>
      </div>
    </div>
  );
}

function useSave() {
  const { actions } = useWallet();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const save = async (c: WalletCredential) => {
    setSaving(true);
    try {
      await actions.addCredential(c);
      toast.success(`${c.name} added`);
      router.push(`/credentials/${encodeURIComponent(c.id)}`);
    } catch {
      toast.error("Could not save the credential");
    } finally {
      setSaving(false);
    }
  };
  return { save, saving };
}

function FromUrl() {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<WalletCredential | null>(null);
  const { save, saving } = useSave();

  const fetchIt = async () => {
    setBusy(true);
    setError("");
    setPreview(null);
    try {
      const target = url.trim();
      if (!/^https:\/\//i.test(target)) throw new Error("Paste an https:// badge link.");
      const candidates = [...credlyJsonCandidates(target), target];
      let json: unknown = null;
      let from = "";
      for (const candidate of candidates) {
        try {
          const res = await fetch(candidate, {
            headers: { Accept: "application/ld+json, application/json" },
          });
          if (!res.ok) continue;
          json = await res.json();
          from = candidate;
          break;
        } catch {
          /* blocked by the issuer's CORS policy or unreachable — try the next */
        }
      }
      if (!json)
        throw new Error(
          "This issuer does not let browsers read the badge directly. Open the badge page, use its \u201cDownload JSON\u201d or \u201cView JSON\u201d option, and paste it under \u201cPaste JSON\u201d.",
        );
      setPreview(parseOpenBadge(json as Record<string, unknown>, { sourceUrl: from }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section
      title="Paste a badge link"
      description="A Credly badge page, a Badgr or Canvas Credentials badge, or any hosted Open Badges assertion or 3.0 credential URL."
    >
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          void fetchIt();
        }}
      >
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.credly.com/badges/…"
          aria-label="Badge URL"
          className="flex-1"
        />
        <Button type="submit" className="ibl-button-primary" disabled={!url.trim() || busy}>
          {busy ? "Fetching…" : "Fetch badge"}
        </Button>
      </form>
      {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
      <p className="text-muted-foreground mt-2 text-xs">
        Fetched by your browser straight from the issuer; the original JSON is kept so you can
        re-export it unchanged. Issuers that block browser reads: paste the JSON instead.
      </p>
      {preview ? (
        <Preview credential={preview} onSave={() => void save(preview)} saving={saving} />
      ) : null}
    </Section>
  );
}

function FromJson() {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<WalletCredential | null>(null);
  const { save, saving } = useSave();

  const parse = (t: string) => {
    setText(t);
    setError("");
    setPreview(null);
    if (!t.trim()) return;
    try {
      setPreview(parseOpenBadge(t));
    } catch (e) {
      setError(e instanceof OpenBadgeParseError ? e.message : "Could not parse that.");
    }
  };

  return (
    <Section
      title="Paste badge JSON"
      description="Open Badges 2.0 assertions, Open Badges 3.0 / Verifiable Credentials, or Credly's badge JSON."
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => parse(JSON.stringify(SAMPLE_OB2_ASSERTION, null, 2))}
          >
            <Sparkles /> Sample 2.0
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => parse(JSON.stringify(SAMPLE_OB3_CREDENTIAL, null, 2))}
          >
            <Sparkles /> Sample 3.0
          </Button>
        </>
      }
    >
      <Textarea
        value={text}
        onChange={(e) => parse(e.target.value)}
        rows={10}
        placeholder='{ "@context": "https://w3id.org/openbadges/v2", "type": "Assertion", … }'
        className="font-mono text-xs"
        aria-label="Badge JSON"
      />
      {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
      {preview ? (
        <Preview credential={preview} onSave={() => void save(preview)} saving={saving} />
      ) : null}
    </Section>
  );
}

function Manual() {
  const { save, saving } = useSave();
  const [f, setF] = useState({
    name: "",
    issuer: "",
    issuerUrl: "",
    kind: "" as CredentialKind | "",
    issuedOn: "",
    expires: "",
    description: "",
    skills: "",
    evidenceUrl: "",
  });
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));
  const valid = f.name.trim() && f.issuer.trim();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const c: WalletCredential = {
      id: newId("self"),
      source: "self",
      kind: (f.kind || guessKind(f.name)) as CredentialKind,
      name: f.name.trim(),
      description: f.description.trim() || undefined,
      issuer: { name: f.issuer.trim(), url: f.issuerUrl.trim() || undefined },
      issuedOn: f.issuedOn ? new Date(f.issuedOn).toISOString() : undefined,
      expires: f.expires ? new Date(f.expires).toISOString() : undefined,
      skills: f.skills
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter(Boolean),
      evidence: f.evidenceUrl.trim()
        ? [{ name: "Supporting document", url: f.evidenceUrl.trim() }]
        : [],
      acceptance: "accepted",
      visibility: "private",
      verification: { level: "self", format: "manual", url: f.evidenceUrl.trim() || undefined },
      collections: [],
      addedAt: new Date().toISOString(),
    };
    void save(c);
  };

  return (
    <Section
      title="Add a record yourself"
      description="For paper certificates, licenses and degrees that never came with a badge. Shown as self-reported until the issuer sends an Open Badge."
    >
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Name *">
          <Input
            value={f.name}
            onChange={(e) => set("name")(e.target.value)}
            placeholder="Texas Notary Public Commission"
            required
          />
        </Field>
        <Field label="Issuer *">
          <Input
            value={f.issuer}
            onChange={(e) => set("issuer")(e.target.value)}
            placeholder="Texas Secretary of State"
            required
          />
        </Field>
        <Field label="Type">
          <Select
            value={f.kind}
            onValueChange={(v) => set("kind")(String(v ?? ""))}
            items={(Object.keys(KIND_LABEL) as CredentialKind[]).map((k) => ({
              value: k,
              label: KIND_LABEL[k],
            }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Guess from the name" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(KIND_LABEL) as CredentialKind[]).map((k) => (
                <SelectItem key={k} value={k}>
                  {KIND_LABEL[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Issuer website">
          <Input
            value={f.issuerUrl}
            onChange={(e) => set("issuerUrl")(e.target.value)}
            placeholder="https://"
            type="url"
          />
        </Field>
        <Field label="Issued on">
          <Input value={f.issuedOn} onChange={(e) => set("issuedOn")(e.target.value)} type="date" />
        </Field>
        <Field label="Expires">
          <Input value={f.expires} onChange={(e) => set("expires")(e.target.value)} type="date" />
        </Field>
        <Field label="Skills (comma-separated)" className="sm:col-span-2">
          <Input
            value={f.skills}
            onChange={(e) => set("skills")(e.target.value)}
            placeholder="Project Management, Communication"
          />
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <Textarea
            value={f.description}
            onChange={(e) => set("description")(e.target.value)}
            rows={3}
          />
        </Field>
        <Field label="Link to a scan or supporting document" className="sm:col-span-2">
          <Input
            value={f.evidenceUrl}
            onChange={(e) => set("evidenceUrl")(e.target.value)}
            placeholder="https://drive.example.com/… (optional)"
            type="url"
          />
        </Field>
        <div className="sm:col-span-2">
          <Button type="submit" className="ibl-button-primary" disabled={!valid || saving}>
            {saving ? "Adding…" : "Add to wallet"}
          </Button>
        </div>
      </form>
    </Section>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function FromPlatform() {
  const { state } = useWallet();
  if (state.isDemo) {
    const sample = state.credentials.filter((c) => c.source === "platform").length;
    return (
      <Section
        title="Credentials from your platforms"
        description="Nothing to import: credentials issued to you on any of your platforms appear in this wallet the moment they are issued."
      >
        <p className="text-sm text-gray-700">
          This demo wallet shows {sample} sample platform-issued credentials. Run it without{" "}
          <code className="rounded bg-gray-100 px-1">NEXT_PUBLIC_WALLET_DEMO</code> and sign in with
          your ibl.ai account to see your own. No platform yet? Create one at{" "}
          <a
            className="text-[#0058cc] underline"
            href="https://ibl.ai/join"
            target="_blank"
            rel="noreferrer"
          >
            ibl.ai/join
          </a>
          .
        </p>
        <p className="text-muted-foreground mt-3 text-xs">
          Issuing is done by your platform's admins (OS → Credentials, or the credentials API).
          Earners accept here.
        </p>
      </Section>
    );
  }

  const tenants = readTenants();
  const rows = platformRows(tenants, state.credentials);
  const nameOf = (key: string) => String(tenants.find((t) => t.key === key)?.platform_name || key);
  return (
    <Section
      title="Credentials from your platforms"
      description="Nothing to import: credentials issued to you on any of your platforms appear in this wallet the moment they are issued."
    >
      <ul className="divide-y divide-gray-100">
        {rows.map((r) => (
          <li key={r.org} className="py-3 first:pt-0">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-gray-900">{r.name}</span>
              <span className="text-muted-foreground shrink-0 text-xs">
                {r.credentials.length} credential{r.credentials.length === 1 ? "" : "s"}
              </span>
            </div>
            {r.credentials.length ? (
              <ul className="mt-1 space-y-0.5">
                {r.credentials.map((c) => (
                  <li key={c.id} className="truncate text-sm">
                    <Link
                      href={`/credentials/${encodeURIComponent(c.id)}`}
                      className="text-[#0058cc] hover:underline"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
      {state.unreachablePlatforms?.length ? (
        <p role="alert" className="mt-2 text-xs text-red-500">
          Could not read your credentials on {state.unreachablePlatforms.map(nameOf).join(", ")}.
        </p>
      ) : null}
      <p className="text-muted-foreground mt-3 text-xs">
        New ones wait under{" "}
        <Link href="/credentials?filter=pending" className="text-[#0058cc] underline">
          Awaiting acceptance
        </Link>{" "}
        until you accept them.
      </p>
    </Section>
  );
}
