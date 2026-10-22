"use client";

/**
 * The wallet's left sidebar: the SDK's cross-SPA `PlatformSidebar` (the same
 * shell os.ibl.ai and the LMS use — logo slot, collapse-to-rail, the invariant
 * footer cluster with its admin/RBAC rules), fed the wallet's own sections.
 *
 * Primary nav rows are direct links (the LMS style: Home, Chats, …) rendered
 * through a custom section; Analytics and Admin are second-level menus that
 * only appear in Admin mode, like the OS. Agents are reached from the Coach
 * (the SDK chat's own agent picker) and Profile from the avatar dropdown.
 */
import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  PlatformSidebar,
  PlatformSidebarCollapsedLabelFlyout,
  usePlatformSidebarFooterActions,
  usePlatformSidebarNavCallback,
  type PlatformSidebarFooterActionId,
  type PlatformSidebarFooterConfig,
  type PlatformSidebarSectionConfig,
} from "@iblai/iblai-js/web-containers/next";
import { Award, BookOpen, FileText, Globe, Home, LineChart, Plus, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { Logo } from "@/components/navbar/logo";
import { useAdminMode } from "@/lib/iblai/admin-mode";
import { cn } from "@/lib/utils";

type NavIcon = React.ComponentType<{ className?: string; strokeWidth?: number }>;
type NavRowSpec = { id: string; label: string; href: string; icon: NavIcon; exact?: boolean };

const WALLET_ROWS: NavRowSpec[] = [
  { id: "home", label: "Wallet", href: "/", icon: Home, exact: true },
  { id: "credentials", label: "Credentials", href: "/credentials", icon: Award },
  { id: "skills", label: "Skills", href: "/skills", icon: TrendingUp },
  { id: "resume", label: "Résumé", href: "/resume", icon: FileText },
  { id: "share", label: "Share", href: "/share", icon: Globe },
];

// Profile is reached from the avatar dropdown (the OS way), not the sidebar.
const COACH_ROWS: NavRowSpec[] = [{ id: "coach", label: "Coach", href: "/coach", icon: Sparkles }];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (href === "/") return pathname === "/";
  const p = pathname.replace(/\/$/, "");
  return exact ? p === href : p === href || p.startsWith(`${href}/`);
}

/** One direct nav row, in the SDK's palette, for both the expanded sidebar and the icon rail. */
function NavRow({ row, collapsed }: { row: NavRowSpec; collapsed: boolean }) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const { onAfterNav } = usePlatformSidebarNavCallback();
  const active = isActive(pathname, row.href, row.exact);
  const Icon = row.icon;
  const go = () => {
    router.push(row.href);
    onAfterNav?.();
  };
  if (collapsed) {
    return (
      <PlatformSidebarCollapsedLabelFlyout label={row.label}>
        <button
          type="button"
          onClick={go}
          aria-label={row.label}
          aria-current={active ? "page" : undefined}
          className={cn(
            "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors",
            active ? "bg-[#eef6fc] text-[#1e40af]" : "text-[#5f5f61] hover:bg-[#f0f0f0]",
          )}
        >
          <Icon className="size-5" strokeWidth={1.5} />
        </button>
      </PlatformSidebarCollapsedLabelFlyout>
    );
  }
  return (
    <button
      type="button"
      onClick={go}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-left text-[14px] font-normal transition-colors",
        active ? "bg-[#eef6fc] text-[#1e40af]" : "text-[#4a5568] hover:bg-[#f4f4f4]",
      )}
    >
      <Icon className={cn("size-5 shrink-0", active ? "text-[#1e40af]" : "text-[#5f5f61]")} strokeWidth={1.5} />
      <span className="min-w-0 flex-1 truncate">{row.label}</span>
    </button>
  );
}

export function WalletSidebar({
  isAdmin,
  tenantKey,
  currentTenant,
  onFooterAction,
  demo,
}: {
  isAdmin: boolean;
  tenantKey: string;
  currentTenant?: { key?: string | null; enable_monetization?: boolean | null } | null;
  onFooterAction: (id: PlatformSidebarFooterActionId) => void;
  demo: boolean;
}) {
  const router = useRouter();
  const { adminMode } = useAdminMode();
  const liveAdmin = isAdmin && adminMode;
  const footerConfig = useMemo<PlatformSidebarFooterConfig | null>(
    () =>
      demo
        ? null
        : {
            isAdmin,
            isLiveAdmin: liveAdmin,
            enableRbac: false,
            rbacPermissions: {},
            tenantKey,
            currentTenant: currentTenant ?? null,
            notificationsAllowed: true,
            invitesUserTypeAllowed: true,
            supportUrl: "https://ibl.ai/docs",
            onAction: onFooterAction,
          },
    [demo, isAdmin, liveAdmin, tenantKey, currentTenant, onFooterAction],
  );

  const sections = useMemo<PlatformSidebarSectionConfig[]>(() => {
    const rows = (id: string, list: NavRowSpec[]): PlatformSidebarSectionConfig => ({
      type: "custom",
      id,
      render: (ctx) => (
        <div className={cn(ctx.collapsed ? "flex flex-col items-center gap-1" : "space-y-0.5")}>
          {list.map((r) => (
            <NavRow key={r.id} row={r} collapsed={ctx.collapsed} />
          ))}
        </div>
      ),
    });
    const out: PlatformSidebarSectionConfig[] = [rows("wallet", WALLET_ROWS)];
    out.push({ type: "divider", id: "d1" }, rows("coach", COACH_ROWS));
    if (liveAdmin) {
      out.push(
        { type: "divider", id: "d2" },
        {
          type: "menu",
          menu: {
            id: "analytics",
            label: "Analytics",
            icon: LineChart,
            items: [
              { id: "an-overview", label: "Overview", href: "/admin/analytics", exact: true },
              { id: "an-users", label: "Users", href: "/admin/analytics/users" },
              { id: "an-topics", label: "Topics", href: "/admin/analytics/topics" },
              { id: "an-transcripts", label: "Transcripts", href: "/admin/analytics/transcripts" },
              { id: "an-financial", label: "Financial", href: "/admin/analytics/financial" },
              { id: "an-reports", label: "Reports", href: "/admin/analytics/reports" },
            ],
          },
        },
      );
    }
    // The footer cluster, pinned to the bottom: the SDK's rows and rules
    // (Notifications, Invites, Management, Integrations, Monetization,
    // Advanced, Support) with the org's Credentials row inside it for admins.
    out.push({
      type: "custom",
      id: "footer",
      render: (ctx) => <FooterCluster collapsed={ctx.collapsed} config={footerConfig} showCredentials={liveAdmin} />,
    });
    return out;
  }, [liveAdmin, footerConfig]);

  return (
    <PlatformSidebar
      className="wallet-sidebar"
      logo={<Logo />}
      primaryAction={{ label: "Add credential", icon: Plus, onClick: () => router.push("/credentials/import") }}
      sections={sections}
      footer={null}
    />
  );
}

const SUPPORT_URL = "https://ibl.ai/docs";

/**
 * The SDK's footer cluster, re-rendered here so a Credentials row can sit
 * inside it: rows and visibility come from `usePlatformSidebarFooterActions`
 * (the OS rules), markup mirrors `PlatformSidebarFooter`.
 */
function FooterCluster({ collapsed, config, showCredentials }: { collapsed: boolean; config: PlatformSidebarFooterConfig | null; showCredentials: boolean }) {
  const actions = usePlatformSidebarFooterActions(config ?? { isAdmin: false, isLiveAdmin: false, enableRbac: false, rbacPermissions: {}, notificationsAllowed: false, onAction: () => {} });
  const rows: { id: string; label: string; icon: NavIcon; onClick?: () => void; href?: string }[] = [
    ...(showCredentials ? [{ id: "credentials", label: "Credentials", icon: ShieldCheck as NavIcon, href: "/admin/credentials" }] : []),
    ...actions.map((a) => ({ id: a.id, label: a.label, icon: a.icon as NavIcon, onClick: () => config?.onAction(a.id) })),
  ];
  if (!config && !showCredentials) return null;
  return (
    <div className={cn("wallet-sidebar-bottom shrink-0 border-t border-[#e2e8f0]", collapsed ? "flex flex-col items-center gap-0.5 px-0 py-3" : "space-y-0.5 py-2")}>
      {rows.map((r) => (
        <FooterRow key={r.id} row={r} collapsed={collapsed} />
      ))}
      {config ? <FooterRow row={{ id: "support", label: "Support", icon: BookOpen, href: SUPPORT_URL }} collapsed={collapsed} /> : null}
    </div>
  );
}

function FooterRow({ row, collapsed }: { row: { id: string; label: string; icon: NavIcon; onClick?: () => void; href?: string }; collapsed: boolean }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const { onAfterNav } = usePlatformSidebarNavCallback();
  const Icon = row.icon;
  const external = !!row.href && /^https?:\/\//.test(row.href);
  const active = !!row.href && !external && isActive(pathname, row.href);
  const go = () => {
    if (row.onClick) row.onClick();
    else if (row.href && external) window.open(row.href, "_blank", "noopener,noreferrer");
    else if (row.href) router.push(row.href);
    onAfterNav?.();
  };
  if (collapsed) {
    return (
      <PlatformSidebarCollapsedLabelFlyout label={row.label}>
        <button type="button" onClick={go} aria-label={row.label} aria-current={active ? "page" : undefined} className={cn("inline-flex size-10 cursor-pointer items-center justify-center rounded-lg transition-colors", active ? "bg-[#eef6fc] text-[#1e40af]" : "text-[#5f5f61] hover:bg-[#f0f0f0]")}>
          <Icon className="size-4 shrink-0" strokeWidth={1.5} />
        </button>
      </PlatformSidebarCollapsedLabelFlyout>
    );
  }
  return (
    <button type="button" onClick={go} aria-current={active ? "page" : undefined} className={cn("flex h-9 w-full min-w-0 cursor-pointer items-center gap-2 rounded-md px-2 text-left text-[14px] font-normal transition-colors", active ? "bg-[#eef6fc] text-[#1e40af]" : "text-[#5f5f61] hover:bg-[#f4f4f4]")}>
      <Icon className="size-4 shrink-0" strokeWidth={1.5} />
      <span className="min-w-0 flex-1 truncate">{row.label}</span>
    </button>
  );
}
