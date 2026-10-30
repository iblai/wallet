"use client";

/**
 * The app shell — the same one os.ibl.ai and the LMS use, from the SDK:
 * `SidebarProvider` → `PlatformSidebar` (left, collapsible to an icon rail)
 * + `SidebarInset` (top bar, content). Footer actions in the sidebar
 * (Notifications, Invites, Management, Integrations, Monetization, Advanced)
 * open the SDK's `PlatformAccountSheet`, exactly as in the OS. A `?tenant=`
 * organization the user does not belong to is previewed (/iblai-vibe-house-journeys).
 */
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { NextIntlClientProvider } from "next-intl";
import { InviteUserDialog } from "@iblai/iblai-js/web-containers";
import {
  PlatformAccountSheet,
  SidebarInset,
  SidebarProvider,
  type PlatformSidebarFooterActionId,
} from "@iblai/iblai-js/web-containers/next";
import { setOpenPricingModal } from "@iblai/iblai-js/web-utils";
import config from "@/lib/iblai/config";
import { resolveAppTenant, readTenants, isTenantAdmin } from "@/lib/iblai/tenant";
import { decideEntry, isSampleOrg, isTrialUser } from "@/lib/iblai/house-journeys";
import { AdminModeProvider } from "@/lib/iblai/admin-mode";
import { DEMO_PROFILE } from "@/lib/wallet/demo-data";
import { WalletProvider } from "@/lib/wallet/provider";
import { WalletSidebar } from "@/components/shell/wallet-sidebar";
import { TopBar } from "@/components/shell/top-bar";
import { DemoBanner } from "@/components/wallet/demo-banner";
import { FirstRunGate } from "@/components/house/first-run-gate";
import { OrganizationPreview } from "@/components/house/organization-preview";
import { SampleNotice } from "@/components/house/sample-notice";
import { UpgradeModal } from "@/components/house/upgrade-modal";
import messages from "@/messages/en.json";

type Session = {
  tenantKey: string;
  username?: string;
  email: string;
  isAdmin: boolean;
  tenants: any[];
  currentTenant?: any;
};

// Read synchronously on the first client render: the providers hold this tree
// until mounted, and the SDK dropdown fetches by `username` on mount.
function readSession(): Session {
  const session: Session = { tenantKey: "", email: "", isAdmin: false, tenants: [] };
  if (typeof window === "undefined") return session;
  try {
    const raw = localStorage.getItem("userData");
    if (raw) {
      const parsed = JSON.parse(raw);
      session.username = parsed.user_nicename ?? parsed.username ?? undefined;
      session.email = parsed.user_email ?? parsed.email ?? "";
    }
  } catch {}
  session.tenantKey = resolveAppTenant();
  session.tenants = readTenants();
  session.currentTenant = session.tenants.find((t) => t.key === session.tenantKey);
  session.isAdmin = isTenantAdmin();
  return session;
}

type SheetTab =
  | "organization"
  | "management"
  | "integrations"
  | "monetization"
  | "advanced"
  | "billing";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [session] = useState(readSession);
  // Org admins start in Admin mode and can switch to the member's view (the OS default).
  const [adminMode, setAdminMode] = useState(true);
  const [sheet, setSheet] = useState<SheetTab | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const { tenantKey, username, email, isAdmin, tenants, currentTenant } = session;
  const pathname = usePathname() ?? "/";
  const routeOrg = useSearchParams()?.get("tenant") ?? "";
  const router = useRouter();
  const dispatch = useDispatch();
  const demo = config.demoMode();
  // The community organization shows the sample to everyone as its admin; the SDK
  // (sidebar footer, profile menu, first run) still sees the session's own role.
  const sample = !demo && isSampleOrg(tenantKey);
  // On the community organization the admin cluster is shown and every click upgrades.
  const trial = !demo && isTrialUser(tenantKey, tenants);
  const liveAdmin = (isAdmin || sample) && adminMode;
  // The admin area is admin-only, in Admin mode only; it reads the organization
  // itself, so on the sample it upgrades instead.
  const blocked = pathname.startsWith("/admin") && (!liveAdmin || sample);

  useEffect(() => {
    if (!blocked) return;
    if (sample) dispatch(setOpenPricingModal(true));
    router.replace("/");
  }, [blocked, sample, dispatch, router]);

  const onFooterAction = (id: PlatformSidebarFooterActionId) => {
    if (trial) {
      dispatch(setOpenPricingModal(true));
      return;
    }
    switch (id) {
      case "notifications":
        router.push("/notifications");
        break;
      case "invites":
        setInviteOpen(true);
        break;
      default:
        setSheet(id);
    }
  };

  const entry = decideEntry({ routeOrg, stored: tenantKey, tenants });
  if (!demo && entry.kind === "preview" && entry.preview) {
    return (
      <NextIntlClientProvider locale="en" messages={messages}>
        <OrganizationPreview org={entry.preview} app={config.iblPlatform()} />
      </NextIntlClientProvider>
    );
  }

  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <AdminModeProvider isAdmin={isAdmin || sample} mode={adminMode} setMode={setAdminMode}>
        <WalletProvider>
          {demo ? null : <UpgradeModal org={tenantKey} app={config.iblPlatform()} />}
          <div className="flex min-h-dvh flex-col bg-white md:h-dvh md:overflow-hidden">
            <SidebarProvider defaultOpen className="min-h-0 flex-1">
              <WalletSidebar
                isAdmin={isAdmin}
                trial={trial}
                tenantKey={tenantKey}
                currentTenant={currentTenant}
                onFooterAction={onFooterAction}
                demo={demo}
              />
              <SidebarInset className="flex min-h-0 w-full flex-1 flex-col bg-white md:overflow-hidden">
                <TopBar
                  tenantKey={tenantKey}
                  username={username}
                  email={email}
                  isAdmin={isAdmin && adminMode}
                  trial={trial}
                  currentTenant={currentTenant}
                  userTenants={tenants}
                  demo={demo}
                />
                {demo ? <DemoBanner /> : null}
                {sample ? <SampleNotice name={DEMO_PROFILE.name} /> : null}
                <main className="flex min-h-0 flex-1 flex-col bg-[var(--sidebar-bg,#fafbfc)] md:overflow-y-auto">
                  {blocked ? null : demo ? (
                    children
                  ) : (
                    <FirstRunGate org={tenantKey} isAdmin={isAdmin} onboardingPath="/onboarding">
                      {children}
                    </FirstRunGate>
                  )}
                </main>
              </SidebarInset>
            </SidebarProvider>
          </div>

          {!demo && tenantKey && username ? (
            <>
              <PlatformAccountSheet
                tab={sheet}
                onClose={() => setSheet(null)}
                tenantKey={tenantKey}
                username={username}
                email={email}
                onInviteClick={() => setInviteOpen(true)}
                mainPlatformKey={config.mainTenantKey()}
                authUrl={config.authUrl()}
                currentSpa="mentor"
                platformBaseDomain={config.platformBaseDomain()}
                onboardingBasePath={window.location.origin}
              />
              <InviteUserDialog
                tenant={tenantKey}
                isOpen={inviteOpen}
                onClose={() => setInviteOpen(false)}
                hasManageUsersPermission={liveAdmin}
              />
            </>
          ) : null}
        </WalletProvider>
      </AdminModeProvider>
    </NextIntlClientProvider>
  );
}
