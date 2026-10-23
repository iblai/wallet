"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Copy, ExternalLink, Eye, EyeOff, FolderOpen, Globe, Link2, Download } from "lucide-react";
import { useWallet } from "@/lib/wallet/provider";
import { resolveAppTenant } from "@/lib/iblai/tenant";
import config from "@/lib/iblai/config";
import { credentialStatus } from "@/lib/wallet/types";
import { toWalletBundle } from "@/lib/wallet/open-badges";
import {
  HANDLE_RE,
  handleFromName,
  linkedInShareUrl,
  publicPageLink,
  summarizeCredential,
  type ShareSnapshot,
} from "@/lib/wallet/share";
import { CredentialCard } from "@/components/wallet/credential-card";
import { Page, Section } from "@/components/wallet/section";
import { PageHeader } from "@/components/page-header";
import { LoadingScreen } from "@/components/loading-screen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

/**
 * One link that proves everything on it. The public wallet page lists the
 * credentials marked public; collections get their own filtered link;
 * the whole record exports as a Learning and Employment Record bundle.
 */
export default function SharePage() {
  const { state, actions } = useWallet();
  const [origin, setOrigin] = useState("");
  const [handle, setHandle] = useState(state.settings.handle ?? "");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  useEffect(() => {
    setHandle(state.settings.handle ?? "");
  }, [state.settings.handle]);

  if (state.isLoading) return <LoadingScreen />;

  const enabled = !!state.settings.publicPageEnabled;
  const org = config.demoMode() ? "demo-wallet" : resolveAppTenant();
  const active = state.credentials.filter((c) => credentialStatus(c) === "active");
  const pub = active.filter((c) => c.visibility === "public");
  const priv = active.filter((c) => c.visibility !== "public");
  // The public link is self-contained (its fragment carries the snapshot);
  // the viewer's browser verifies platform-issued credentials against ibl.ai.
  const snapshot: ShareSnapshot = {
    v: 1,
    org,
    username: state.profile.username,
    profile: {
      name: state.profile.name,
      headline: state.profile.headline,
      location: state.profile.location,
      about: state.profile.about,
      image: state.profile.image,
      links: state.profile.links,
    },
    platformIds: pub.filter((c) => c.source === "platform").map((c) => c.id),
    credentials: pub.filter((c) => c.source !== "platform").map(summarizeCredential),
    collections: state.collections
      .filter((c) => c.shared)
      .map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        credentialIds: pub.filter((x) => x.collections.includes(c.id)).map((x) => x.id),
      })),
    targetRoleId: state.settings.targetRoleId,
  };
  const publicUrl = config.demoMode()
    ? `${origin}/p/demo-wallet/${encodeURIComponent(state.profile.username)}`
    : publicPageLink(snapshot, origin);
  const publicPath = publicUrl.replace(origin, "");

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link copied");
    } catch {
      toast.error("Clipboard unavailable");
    }
  };
  const act = async (fn: () => Promise<unknown>, msg: string) => {
    try {
      await fn();
      toast.success(msg);
    } catch {
      toast.error("Could not save");
    }
  };
  const exportBundle = () => {
    const bundle = toWalletBundle(pub, {
      name: state.profile.name,
      email: state.profile.email,
      url: publicUrl,
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" }),
    );
    a.download = `${state.profile.username}-wallet.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        icon={<Globe />}
        title="Share"
        description="Your public wallet page, collection links, and the portable record."
      />
      <Page>
        <Section
          title="Public wallet page"
          description="Employers and admissions offices open it without an account. The link itself carries your public credentials; platform-issued ones are verified live against ibl.ai by the viewer\u2019s browser. Re-copy it after changes."
          actions={
            <div className="flex items-center gap-2 text-sm">
              <Label htmlFor="public-on">{enabled ? "On" : "Off"}</Label>
              <Switch
                id="public-on"
                checked={enabled}
                onCheckedChange={(on: boolean) =>
                  void act(
                    () =>
                      actions.setPublicPage({
                        enabled: on,
                        handle: handle || handleFromName(state.profile.name),
                      }),
                    on ? "Public page is live" : "Public page is off",
                  )
                }
              />
            </div>
          }
        >
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <Label className="text-muted-foreground text-xs">Your link</Label>
              <div className="mt-1 flex gap-2">
                <Input readOnly value={publicUrl} className="font-mono text-xs" />
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Copy public link"
                  onClick={() => copy(publicUrl)}
                  disabled={!enabled}
                >
                  <Copy />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Open public page"
                  nativeButton={false}
                  render={<Link href={publicPath} target="_blank" />}
                  disabled={!enabled}
                >
                  <ExternalLink />
                </Button>
              </div>
              <div className="mt-3">
                <Label htmlFor="handle" className="text-muted-foreground text-xs">
                  Display handle (shown on the page)
                </Label>
                <div className="mt-1 flex gap-2">
                  <Input
                    id="handle"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.toLowerCase())}
                    placeholder={handleFromName(state.profile.name)}
                    className="w-64"
                  />
                  <Button
                    variant="outline"
                    disabled={!!handle && !HANDLE_RE.test(handle)}
                    onClick={() =>
                      void act(() => actions.setPublicPage({ handle }), "Handle saved")
                    }
                  >
                    Save
                  </Button>
                </div>
                {handle && !HANDLE_RE.test(handle) ? (
                  <p className="mt-1 text-xs text-red-500">
                    Lowercase letters, digits and dashes, 3–32 characters.
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                disabled={!enabled}
                nativeButton={false}
                render={
                  <a
                    href={linkedInShareUrl(publicUrl)}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Post on LinkedIn"
                  />
                }
              >
                <Link2 /> Post on LinkedIn
              </Button>
              <Button variant="outline" onClick={exportBundle} disabled={!pub.length}>
                <Download /> Export record (OB3 bundle)
              </Button>
            </div>
          </div>
          {!enabled ? (
            <p className="text-muted-foreground mt-3 text-xs">
              Turn the page on to share it. Private credentials and declined or expired ones never
              appear.
            </p>
          ) : null}
        </Section>

        {state.collections.length ? (
          <Section
            className="mt-5"
            title="Collection links"
            description="A filtered view of your public page — send only what an application needs."
          >
            <ul className="divide-y divide-gray-100">
              {state.collections.map((col) => {
                const url = config.demoMode()
                  ? `${publicUrl}?collection=${encodeURIComponent(col.id)}`
                  : publicPageLink(snapshot, origin, col.id);
                const n = pub.filter((c) => c.collections.includes(col.id)).length;
                return (
                  <li
                    key={col.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <FolderOpen className="size-4 shrink-0 text-[#0058cc]" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">{col.name}</p>
                        <p className="text-muted-foreground truncate text-xs">
                          {n} public credential{n === 1 ? "" : "s"}
                          {col.description ? ` · ${col.description}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`share-${col.id}`} className="text-xs text-gray-600">
                        Shareable
                      </Label>
                      <Switch
                        id={`share-${col.id}`}
                        checked={col.shared}
                        onCheckedChange={(on: boolean) =>
                          void act(
                            () => actions.updateCollection(col.id, { shared: on }),
                            on ? "Collection link on" : "Collection link off",
                          )
                        }
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!enabled || !col.shared}
                        onClick={() => copy(url)}
                      >
                        <Copy /> Copy link
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Section>
        ) : null}

        <div className="mt-5 grid gap-5 lg:grid-cols-2 [&>*]:min-w-0">
          <Section
            title={`Public (${pub.length})`}
            description="Shown on your page and in the exported record."
          >
            <div className="space-y-2">
              {pub.map((c) => (
                <div key={c.id} className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <CredentialCard
                      credential={c}
                      href={`/credentials/${encodeURIComponent(c.id)}`}
                      compact
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Make private"
                    onClick={() =>
                      void act(
                        () => actions.updateCredential(c.id, { visibility: "private" }),
                        "Now private",
                      )
                    }
                  >
                    <EyeOff />
                  </Button>
                </div>
              ))}
              {!pub.length ? (
                <p className="text-muted-foreground text-sm">Nothing public yet.</p>
              ) : null}
            </div>
          </Section>
          <Section title={`Private (${priv.length})`} description="In your wallet only.">
            <div className="space-y-2">
              {priv.map((c) => (
                <div key={c.id} className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <CredentialCard
                      credential={c}
                      href={`/credentials/${encodeURIComponent(c.id)}`}
                      compact
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Make public"
                    onClick={() =>
                      void act(
                        () => actions.updateCredential(c.id, { visibility: "public" }),
                        "Now public",
                      )
                    }
                  >
                    <Eye />
                  </Button>
                </div>
              ))}
              {!priv.length ? (
                <p className="text-muted-foreground text-sm">Everything active is public.</p>
              ) : null}
            </div>
          </Section>
        </div>
      </Page>
    </div>
  );
}
