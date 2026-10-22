"use client";

/**
 * The top bar: the SDK's cross-SPA `PlatformNavbar` (right cluster —
 * notifications, profile — is the invariant chrome every ibl.ai SPA shares),
 * with the wallet's page title on the left and the User/Admin switch as the
 * mode switcher, the way os.ibl.ai does it. Nothing else: no logo (the
 * sidebar has it), no link row (the sidebar has those).
 */
import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PlatformNavbar } from "@iblai/iblai-js/web-containers";
import { SidebarTrigger } from "@iblai/iblai-js/web-containers/next";
import { AdminModeSwitch } from "@/components/navbar/admin-mode-switch";
import { UserProfileButton } from "@/components/navbar/user-profile-button";
import { DemoUserMenu } from "@/components/wallet/demo-user-menu";
import config from "@/lib/iblai/config";
import { handleLogout, switchTenant } from "@/lib/iblai/auth-utils";

const TITLES: [RegExp, string][] = [
  [/^\/$/, "Wallet"],
  [/^\/credentials\/import/, "Add a credential"],
  [/^\/credentials\/.+/, "Credential"],
  [/^\/credentials/, "Credentials"],
  [/^\/skills/, "Skills"],
  [/^\/resume/, "Résumé"],
  [/^\/share/, "Share"],
  [/^\/coach/, "Coach"],
  [/^\/agents/, "Agents"],
  [/^\/profile/, "Profile"],
  [/^\/account/, "Account"],
  [/^\/notifications/, "Notifications"],
  [/^\/admin\/credentials/, "Credentials"],
  [/^\/admin\/users/, "Users"],
  [/^\/admin\/analytics/, "Analytics"],
  [/^\/admin\/billing/, "Billing"],
  [/^\/admin\/memory/, "Memory"],
  [/^\/admin\/organization/, "Organization"],
];

export function pageTitle(pathname: string): string {
  return TITLES.find(([re]) => re.test(pathname))?.[1] ?? "Wallet";
}

export function TopBar({
  tenantKey,
  username,
  email,
  isAdmin,
  currentTenant,
  userTenants,
  demo,
}: {
  tenantKey: string;
  username?: string;
  email: string;
  isAdmin: boolean;
  currentTenant?: any;
  userTenants: any[];
  demo: boolean;
}) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const onViewNotifications = useCallback((id?: string) => router.push(`/notifications/${id ?? ""}`), [router]);

  return (
    <PlatformNavbar
      className="h-16 border-b border-[#D0E0FF] bg-white"
      left={
        <div className="flex items-center gap-2 pl-4">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-sm font-medium text-[#646464]">{pageTitle(pathname)}</h1>
        </div>
      }
      modeSwitcher={<AdminModeSwitch />}
      // The Incognito toggle belongs to chat pages only, as in the OS.
      privacyToggle={!demo && tenantKey && username && pathname.startsWith("/coach") ? { org: tenantKey, userId: username } : null}
      notifications={!demo && tenantKey && username ? { org: tenantKey, userId: username, isAdmin, onViewNotifications } : null}
      creditBalance={
        !demo && tenantKey && username
          ? {
              tenantKey,
              currentTenant,
              stripeEnabled: true,
              isLiveAdmin: isAdmin,
              mainPlatformKey: config.mainTenantKey(),
              currentUserEmail: email,
              username,
            }
          : null
      }
      profile={
        demo ? (
          <DemoUserMenu />
        ) : (
          <UserProfileButton
            username={username}
            email={email}
            mainPlatformKey={config.mainTenantKey()}
            isAdmin={isAdmin}
            tenantKey={tenantKey}
            currentTenant={currentTenant}
            userTenants={userTenants}
            authURL={config.authUrl()}
            onLogout={() => handleLogout()}
            onTenantChange={(key: string) => void switchTenant(key)}
          />
        )
      }
    />
  );
}
