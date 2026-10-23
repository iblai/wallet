"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FolderPlus,
  Mail,
  Printer,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import { useWallet } from "@/lib/wallet/provider";
import { resolveAppTenant } from "@/lib/iblai/tenant";
import config from "@/lib/iblai/config";
import { credentialStatus, daysUntilExpiry, type WalletCredential } from "@/lib/wallet/types";
import { exportOriginal, toOpenBadge3 } from "@/lib/wallet/open-badges";
import {
  embedSnippet,
  linkedInAddToProfileUrl,
  linkedInShareUrl,
  mailtoShare,
  shareBlurb,
  verifyLink,
  xShareUrl,
} from "@/lib/wallet/share";
import { canonicalSkill, ROLES } from "@/lib/wallet/market";
import { CredentialImage } from "@/components/wallet/credential-card";
import {
  KindBadge,
  LinkedInIcon,
  SkillChip,
  StatusBadge,
  VerificationBadge,
} from "@/components/wallet/badges";
import { Page, Section } from "@/components/wallet/section";
import { EmptyState } from "@/components/empty-state";
import { LoadingScreen } from "@/components/loading-screen";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fmt = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

export default function CredentialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, actions } = useWallet();
  const router = useRouter();
  const c = state.credentials.find((x) => x.id === decodeURIComponent(id));
  const [shareOpen, setShareOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);

  if (state.isLoading) return <LoadingScreen />;
  if (!c)
    return (
      <Page>
        <EmptyState
          title="Credential not found"
          description="It may have been removed from this wallet."
          action={
            <Link
              href="/credentials"
              className="text-sm font-medium text-[#0058cc] hover:underline"
            >
              Back to credentials
            </Link>
          }
        />
      </Page>
    );

  const status = credentialStatus(c);
  const days = daysUntilExpiry(c);
  const org = config.demoMode() ? "demo-wallet" : resolveAppTenant();
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const verifyUrl = verifyLink(c, origin, { org, username: state.profile.username });
  const verifyRel = verifyUrl.replace(origin, "");
  const rolesUsing = ROLES.filter((r) =>
    r.skills.some((s) => c.skills.map(canonicalSkill).includes(s.name)),
  ).slice(0, 4);

  const download = (name: string, data: unknown) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const act = async (fn: () => Promise<void>, msg: string) => {
    try {
      await fn();
      toast.success(msg);
    } catch {
      toast.error("Could not save that change");
    }
  };

  return (
    <Page>
      <Link
        href="/credentials"
        className="text-muted-foreground inline-flex items-center gap-1 text-sm hover:text-[#0058cc]"
      >
        <ArrowLeft className="size-4" /> Credentials
      </Link>

      <div className="mt-3 grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-5">
          <Section>
            <div className="flex flex-col gap-5 sm:flex-row">
              <CredentialImage credential={c} size={136} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-1.5">
                  <KindBadge kind={c.kind} />
                  <VerificationBadge level={c.verification.level} />
                  <StatusBadge credential={c} />
                </div>
                <h1 className="mt-2 text-2xl font-semibold text-gray-800">{c.name}</h1>
                <p className="text-sm text-gray-600">
                  Issued by{" "}
                  {c.issuer.url ? (
                    <a
                      href={c.issuer.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-[#0058cc] hover:underline"
                    >
                      {c.issuer.name}
                    </a>
                  ) : (
                    <span className="font-medium">{c.issuer.name}</span>
                  )}
                  {c.context?.course
                    ? ` · ${c.context.course}`
                    : c.context?.program
                      ? ` · ${c.context.program}`
                      : ""}
                </p>
                {c.description ? (
                  <p className="mt-3 text-sm text-gray-700">{c.description}</p>
                ) : null}
                <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-muted-foreground text-xs">Issued</dt>
                    <dd className="font-medium text-gray-900">{fmt(c.issuedOn)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">Expires</dt>
                    <dd className="font-medium text-gray-900">
                      {c.expires ? fmt(c.expires) : "Never"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">Visibility</dt>
                    <dd className="font-medium text-gray-900">
                      {c.visibility === "public" ? "Public" : "Private"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {status === "pending" ? (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="text-sm text-blue-900">
                  <strong className="font-semibold">{c.issuer.name} issued this to you.</strong>{" "}
                  Accept it to add it to your record and make it shareable, or decline it.
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      act(
                        () => actions.updateCredential(c.id, { acceptance: "declined" }),
                        "Declined",
                      )
                    }
                  >
                    <X /> Decline
                  </Button>
                  <Button
                    className="ibl-button-primary"
                    onClick={() =>
                      act(
                        () =>
                          actions.updateCredential(c.id, {
                            acceptance: "accepted",
                            visibility: "public",
                          }),
                        "Accepted and made public",
                      )
                    }
                  >
                    <Check /> Accept
                  </Button>
                </div>
              </div>
            ) : null}
            {status === "active" && days !== null && days <= 90 ? (
              <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <strong className="font-semibold">Expires in {days} days.</strong> Check{" "}
                {c.issuer.url ? (
                  <a className="underline" href={c.issuer.url} target="_blank" rel="noreferrer">
                    {c.issuer.name}
                  </a>
                ) : (
                  c.issuer.name
                )}{" "}
                for the renewal path; most ATS filters drop a lapsed certification.
              </div>
            ) : null}
            {status === "revoked" ? (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                <strong className="font-semibold">Revoked by the issuer.</strong>{" "}
                {c.revocationReason ?? ""} It stays in your wallet for your records but is never
                shared.
              </div>
            ) : null}
          </Section>

          {c.criteria || c.criteriaUrl ? (
            <Section title="Earning criteria" description="What the issuer required.">
              {c.criteria ? <p className="text-sm text-gray-700">{c.criteria}</p> : null}
              {c.criteriaUrl ? (
                <a
                  href={c.criteriaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#0058cc] hover:underline"
                >
                  Issuer's criteria page <ExternalLink className="size-3.5" />
                </a>
              ) : null}
            </Section>
          ) : null}

          {c.evidence?.length ? (
            <Section title="Evidence" description="What was submitted to earn it.">
              <ul className="space-y-2 text-sm">
                {c.evidence.map((e, i) => (
                  <li key={i}>
                    {e.url ? (
                      <a
                        href={e.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-[#0058cc] hover:underline"
                      >
                        {e.name}
                      </a>
                    ) : (
                      <span className="font-medium text-gray-900">{e.name}</span>
                    )}
                    {e.description ? (
                      <span className="text-muted-foreground"> — {e.description}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          <Section
            title="Skills attested"
            description={
              c.skills.length
                ? "Each one counts toward your skills profile and role fit."
                : "This credential lists no skills."
            }
          >
            <div className="flex flex-wrap gap-1.5">
              {c.skills.map((s) => (
                <SkillChip key={s} name={s} />
              ))}
            </div>
            {rolesUsing.length ? (
              <p className="mt-4 text-sm text-gray-600">
                Employers ask for these in{" "}
                {rolesUsing.map((r, i) => (
                  <span key={r.id}>
                    <Link
                      href={`/skills?role=${r.id}`}
                      className="font-medium text-[#0058cc] hover:underline"
                    >
                      {r.title}
                    </Link>
                    {i < rolesUsing.length - 1 ? ", " : ""}
                  </span>
                ))}{" "}
                roles.
              </p>
            ) : null}
          </Section>
        </div>

        <div className="min-w-0 space-y-5">
          <Section title="Verification">
            <VerificationBadge level={c.verification.level} />
            <p className="mt-2 text-sm text-gray-600">
              {c.verification.level === "platform"
                ? "Issued on ibl.ai. The public assertion endpoint confirms it, and reports revocation the moment the issuer revokes."
                : c.verification.level === "hosted"
                  ? "The issuer hosts this badge at a public URL. The verify page re-fetches it each time."
                  : c.verification.level === "signed"
                    ? "Carries an Open Badges 3.0 proof block from the issuer."
                    : c.verification.level === "self"
                      ? "You added this yourself. Ask the issuer for an Open Badge to upgrade it."
                      : "Imported without a verifiable link."}
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <Link
                href={verifyRel}
                className="inline-flex items-center gap-1 text-sm font-medium text-[#0058cc] hover:underline"
              >
                Open the public verify page <ExternalLink className="size-3.5" />
              </Link>
              {c.verification.url ? (
                <a
                  href={c.verification.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#0058cc] hover:underline"
                >
                  Issuer's record <ExternalLink className="size-3.5" />
                </a>
              ) : null}
            </div>
          </Section>

          <Section title="Share">
            <div className="grid gap-2">
              <Button
                className="ibl-button-primary justify-start overflow-hidden"
                disabled={status !== "active"}
                onClick={() => setShareOpen(true)}
              >
                <Share2 /> Share…
              </Button>
              <Button
                variant="outline"
                className="justify-start overflow-hidden"
                disabled={status !== "active"}
                nativeButton={false}
                render={
                  <a
                    href={linkedInAddToProfileUrl(c, verifyUrl)}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Add to LinkedIn profile"
                  />
                }
              >
                <LinkedInIcon /> Add to LinkedIn profile
              </Button>
              <Button
                variant="outline"
                className="justify-start overflow-hidden"
                onClick={() =>
                  act(
                    () =>
                      actions.updateCredential(c.id, {
                        visibility: c.visibility === "public" ? "private" : "public",
                      }),
                    c.visibility === "public" ? "Now private" : "Now public",
                  )
                }
                disabled={status === "revoked" || status === "pending"}
              >
                {c.visibility === "public" ? <EyeOff /> : <Eye />}{" "}
                {c.visibility === "public" ? "Make private" : "Make public"}
              </Button>
            </div>
            {status !== "active" ? (
              <p className="text-muted-foreground mt-2 text-xs">
                Only active, accepted credentials can be shared.
              </p>
            ) : null}
          </Section>

          <Section title="Export">
            <div className="grid gap-2">
              <Button
                variant="outline"
                className="justify-start overflow-hidden"
                onClick={() =>
                  download(
                    `${slugify(c.name)}.ob3.json`,
                    toOpenBadge3(c, {
                      name: state.profile.name,
                      email: state.profile.email,
                      url: verifyUrl,
                    }),
                  )
                }
              >
                <Download /> Open Badges 3.0 JSON
              </Button>
              {exportOriginal(c) ? (
                <Button
                  variant="outline"
                  className="justify-start overflow-hidden"
                  onClick={() => download(`${slugify(c.name)}.original.json`, exportOriginal(c))}
                >
                  <Download /> Original issuer JSON
                </Button>
              ) : null}
              <Button
                variant="outline"
                className="justify-start overflow-hidden"
                onClick={() => window.print()}
              >
                <Printer /> Print / save as PDF
              </Button>
            </div>
          </Section>

          <Section title="Organize">
            <div className="flex flex-wrap gap-1.5">
              {c.collections.map((id) => {
                const col = state.collections.find((x) => x.id === id);
                return col ? <SkillChip key={id} name={col.name} /> : null;
              })}
              {!c.collections.length ? (
                <span className="text-muted-foreground text-sm">Not in a collection.</span>
              ) : null}
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <Button
                variant="outline"
                className="justify-start overflow-hidden"
                onClick={() => setCollectionsOpen(true)}
              >
                <FolderPlus /> Collections…
              </Button>
              {c.source !== "platform" ? (
                <Button
                  variant="destructive"
                  className="justify-start overflow-hidden"
                  onClick={() => {
                    if (!confirm(`Remove "${c.name}" from your wallet?`)) return;
                    void act(() => actions.removeCredential(c.id), "Removed").then(() =>
                      router.push("/credentials"),
                    );
                  }}
                >
                  <Trash2 /> Remove from wallet
                </Button>
              ) : (
                <p className="text-muted-foreground text-xs">
                  Issued on the platform; only the issuer can withdraw it.
                </p>
              )}
            </div>
          </Section>
        </div>
      </div>

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        credential={c}
        verifyUrl={verifyUrl}
      />
      <CollectionsDialog open={collectionsOpen} onOpenChange={setCollectionsOpen} credential={c} />
    </Page>
  );
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ShareDialog({
  open,
  onOpenChange,
  credential: c,
  verifyUrl,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  credential: WalletCredential;
  verifyUrl: string;
}) {
  const blurb = useMemo(() => shareBlurb(c, verifyUrl), [c, verifyUrl]);
  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${what} copied`);
    } catch {
      toast.error("Clipboard unavailable");
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share {c.name}</DialogTitle>
          <DialogDescription>
            Every link below lands on the public verify page, so whoever opens it sees the issuer's
            confirmation, not a screenshot.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-muted-foreground text-xs">Verify link</Label>
            <div className="mt-1 flex gap-2">
              <Input readOnly value={verifyUrl} className="font-mono text-xs" />
              <Button
                variant="outline"
                size="icon"
                aria-label="Copy link"
                onClick={() => copy(verifyUrl, "Link")}
              >
                <Copy />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              nativeButton={false}
              render={
                <a
                  href={linkedInAddToProfileUrl(c, verifyUrl)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Add to LinkedIn profile"
                />
              }
            >
              <LinkedInIcon /> LinkedIn profile
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={
                <a
                  href={linkedInShareUrl(verifyUrl)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Share on LinkedIn"
                />
              }
            >
              <Share2 /> LinkedIn post
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={
                <a
                  href={xShareUrl(blurb, verifyUrl)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Share on X"
                />
              }
            >
              <Share2 /> X
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<a href={mailtoShare(c, verifyUrl)} aria-label="Share by email" />}
            >
              <Mail /> Email
            </Button>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Ready-to-paste text</Label>
            <textarea
              readOnly
              value={blurb}
              rows={3}
              className="border-input mt-1 w-full rounded-lg border bg-[#f9fafb] p-2 text-sm"
            />
            <Button variant="ghost" size="sm" onClick={() => copy(blurb, "Text")}>
              <Copy /> Copy text
            </Button>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Embed on a site</Label>
            <textarea
              readOnly
              value={embedSnippet(c, verifyUrl)}
              rows={3}
              className="border-input mt-1 w-full rounded-lg border bg-[#f9fafb] p-2 font-mono text-xs"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copy(embedSnippet(c, verifyUrl), "Embed code")}
            >
              <Copy /> Copy embed
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CollectionsDialog({
  open,
  onOpenChange,
  credential: c,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  credential: WalletCredential;
}) {
  const { state, actions } = useWallet();
  const [name, setName] = useState("");
  const toggle = async (id: string) => {
    const next = c.collections.includes(id)
      ? c.collections.filter((x) => x !== id)
      : [...c.collections, id];
    await actions.updateCredential(c.id, { collections: next });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Collections</DialogTitle>
          <DialogDescription>
            Group credentials for a purpose — "Data roles", "Teaching license renewal" — and share a
            collection on its own link.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {state.collections.map((col) => (
            <label
              key={col.id}
              className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <Checkbox
                checked={c.collections.includes(col.id)}
                onCheckedChange={() => void toggle(col.id)}
              />
              <span className="flex-1">
                <span className="font-medium text-gray-900">{col.name}</span>
                {col.description ? (
                  <span className="text-muted-foreground block text-xs">{col.description}</span>
                ) : null}
              </span>
            </label>
          ))}
          {!state.collections.length ? (
            <p className="text-muted-foreground text-sm">No collections yet.</p>
          ) : null}
        </div>
        <form
          className="mt-3 flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!name.trim()) return;
            const col = await actions.addCollection(name.trim());
            await actions.updateCredential(c.id, { collections: [...c.collections, col.id] });
            setName("");
            toast.success(`Added to ${col.name}`);
          }}
        >
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New collection name"
            aria-label="New collection name"
          />
          <Button type="submit" variant="outline">
            <FolderPlus /> Create
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
