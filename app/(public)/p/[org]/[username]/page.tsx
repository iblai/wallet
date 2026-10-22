"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import config from "@/lib/iblai/config";
import { credentialStatus, type WalletCredential } from "@/lib/wallet/types";
import { WalletProvider, useWallet } from "@/lib/wallet/provider";
import { readFragment, type ShareSnapshot, type SharedCredential } from "@/lib/wallet/share";
import { fetchPublicAssertion } from "@/lib/wallet/public-platform";
import { PublicWallet, type PublicSnapshot } from "@/components/wallet/public-wallet";
import { EmptyState } from "@/components/empty-state";
import { LoadingScreen } from "@/components/loading-screen";

/**
 * The public wallet page. No server of ours is involved: the link's fragment
 * carries the holder's public-safe snapshot, and every platform-issued
 * credential in it is re-read live from ibl.ai's public assertion endpoint by
 * the viewer's browser — revoked ones drop out on their own. Imported and
 * self-reported credentials show with their verification level and the
 * issuer's link.
 */
export default function PublicPage({ params }: { params: Promise<{ org: string; username: string }> }) {
  const { org, username } = use(params);
  return (
    <Suspense fallback={<LoadingScreen />}>
      {config.demoMode() ? (
        <WalletProvider>
          <DemoPublic username={decodeURIComponent(username)} />
        </WalletProvider>
      ) : (
        <LinkPublic org={decodeURIComponent(org)} username={decodeURIComponent(username)} />
      )}
    </Suspense>
  );
}

function NotFound() {
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-16 md:px-6">
      <EmptyState title="No public wallet here" description="This link carries no wallet, or the holder has not published one. Ask them for a fresh link from their Share page." />
    </div>
  );
}

function DemoPublic({ username }: { username: string }) {
  const { state } = useWallet();
  const collection = useSearchParams().get("collection") ?? undefined;
  if (state.isLoading) return <LoadingScreen />;
  if (!state.settings.publicPageEnabled || username !== state.profile.username) return <NotFound />;
  const credentials = state.credentials.filter((c) => c.visibility === "public" && credentialStatus(c) === "active");
  const data: PublicSnapshot = {
    org: "demo-wallet",
    username,
    handle: state.settings.handle || username,
    profile: state.profile,
    credentials,
    skills: [...new Set(credentials.flatMap((c) => c.skills))],
    collections: state.collections.filter((c) => c.shared),
    targetRoleId: state.settings.targetRoleId,
  };
  return <PublicWallet data={data} collectionId={collection} />;
}

function sharedToCredential(s: SharedCredential): WalletCredential {
  return {
    ...s,
    acceptance: "accepted",
    visibility: "public",
    collections: [],
    addedAt: s.issuedOn ?? new Date(0).toISOString(),
  };
}

function LinkPublic({ org, username }: { org: string; username: string }) {
  const collection = useSearchParams().get("collection") ?? undefined;
  const [data, setData] = useState<PublicSnapshot | null | undefined>(undefined);

  useEffect(() => {
    const snap = readFragment<ShareSnapshot>("d");
    if (!snap || snap.v !== 1 || snap.username !== username) {
      setData(null);
      return;
    }
    let cancelled = false;
    (async () => {
      // Platform-issued: the viewer's browser asks ibl.ai directly.
      const live = await Promise.all(snap.platformIds.map((id) => fetchPublicAssertion(id).catch(() => null)));
      const platform = live.filter((c): c is WalletCredential => !!c && !c.revoked);
      const others = snap.credentials.map(sharedToCredential);
      const credentials = [...platform, ...others].filter((c) => credentialStatus(c) === "active");
      const colMap = new Map((snap.collections ?? []).map((c) => [c.id, c]));
      for (const c of credentials) c.collections = [...colMap.values()].filter((col) => col.credentialIds.includes(c.id)).map((col) => col.id);
      if (cancelled) return;
      setData({
        org: snap.org || org,
        username,
        handle: username,
        profile: snap.profile,
        credentials,
        skills: [...new Set(credentials.flatMap((c) => c.skills))],
        collections: (snap.collections ?? []).map((c) => ({ id: c.id, name: c.name, description: c.description, shared: true })),
        targetRoleId: snap.targetRoleId,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [org, username]);

  if (data === undefined) return <LoadingScreen />;
  if (!data) return <NotFound />;
  return <PublicWallet data={data} collectionId={collection} />;
}
