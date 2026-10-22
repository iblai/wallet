"use client";

/**
 * The app shell — the same one os.ibl.ai and the LMS use, from the SDK:
 * `SidebarProvider` → `PlatformSidebar` (left, collapsible to an icon rail)
 * + `SidebarInset` (top bar, content). Footer actions in the sidebar
 * (Notifications, Invites, Management, Integrations, Monetization, Advanced)
 * open the SDK's `PlatformAccountSheet`, exactly as in the OS.
 */
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { InviteUserDialog } from "@iblai/iblai-js/web-containers";
import {
  PlatformAccountSheet,
  SidebarInset,
  SidebarProvider,
  type PlatformSidebarFooterActionId,
} from "@iblai/iblai-js/web-containers/next";
import config from "@/lib/iblai/config";
import { resolveAppTenant, readTenants, isTenantAdmin } from "@/lib/iblai/tenant";
import { AdminModeProvider } from "@/lib/iblai/admin-mode";
import { WalletProvider } from "@/lib/wallet/provider";
import { WalletSidebar } from "@/components/shell/wallet-sidebar";
import { TopBar } from "@/components/shell/top-bar";
import { DemoBanner } from "@/components/wallet/demo-banner";

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

type SheetTab = "organization" | "management" | "integrations" | "monetization" | "advanced" | "billing";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [session] = useState(readSession);
  // Org admins start in Admin mode and can switch to the member's view (the OS default).
  const [adminMode, setAdminMode] = useState(true);
  const [sheet, setSheet] = useState<SheetTab | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const { tenantKey, username, email, isAdmin, tenants, currentTenant } = session;
  const liveAdmin = isAdmin && adminMode;
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const demo = config.demoMode();

  // The admin area is admin-only, in Admin mode only.
  useEffect(() => {
    if (pathname.startsWith("/admin") && !liveAdmin) router.replace("/");
  }, [pathname, liveAdmin, router]);

  const onFooterAction = (id: PlatformSidebarFooterActionId) => {
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

  return (
    <AdminModeProvider isAdmin={isAdmin} mode={adminMode} setMode={setAdminMode}>
      <WalletProvider>
        <SidebarProvider defaultOpen>
          <WalletSidebar isAdmin={isAdmin} tenantKey={tenantKey} currentTenant={currentTenant} onFooterAction={onFooterAction} demo={demo} />
          <SidebarInset className="flex h-screen min-w-0 flex-col overflow-hidden bg-white">
            <TopBar tenantKey={tenantKey} username={username} email={email} isAdmin={liveAdmin} currentTenant={currentTenant} userTenants={tenants} demo={demo} />
            {demo ? <DemoBanner /> : null}
            <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--sidebar-bg,#fafbfc)]">
              {pathname.startsWith("/admin") && !liveAdmin ? null : children}
            </main>
          </SidebarInset>
        </SidebarProvider>

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
            />
            <InviteUserDialog tenant={tenantKey} isOpen={inviteOpen} onClose={() => setInviteOpen(false)} hasManageUsersPermission={liveAdmin} />
          </>
        ) : null}
      </WalletProvider>
    </AdminModeProvider>
  );
}
