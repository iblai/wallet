"use client";

/**
 * ibl.ai Provider wrapper.
 *
 * Wrap your root layout children with <IblaiProviders> to get:
 *  - Redux store (RTK Query for IBL APIs)
 *  - AuthProvider  (SSO redirect, JWT validation, cross-SPA sync)
 *  - TenantProvider (multi-tenant routing)
 *
 * Usage in app/layout.tsx:
 *
 *   import { IblaiProviders } from "@/providers/iblai-providers";
 *   export default function RootLayout({ children }) {
 *     return <html><body><IblaiProviders>{children}</IblaiProviders></body></html>;
 *   }
 */

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { usePathname, useSearchParams } from "next/navigation";
import { initializeDataLayer, type TokenResponse } from "@iblai/iblai-js/data-layer";
import { AuthProvider, TenantProvider, ServiceWorkerProvider } from "@iblai/iblai-js/web-utils";
import { Toaster } from "sonner";
import { RadixPointerEventsGuard } from "@/components/radix-pointer-events-guard";
import { LoadingScreen } from "@/components/loading-screen";

import { iblaiStore } from "@/store/iblai-store";
import { LocalStorageService } from "@/lib/iblai/storage-service";
import config from "@/lib/iblai/config";
import { resolveAppTenant, checkTenantMismatch, setAppTenant } from "@/lib/iblai/tenant";
import { redirectToAuthSpa, switchTenant } from "@/lib/iblai/auth-utils";

const storageService = LocalStorageService.getInstance();

// The SDK logs the session tokens with console.log; production keeps warnings and errors only.
if (process.env.NODE_ENV === "production" && typeof window !== "undefined") {
  console.log = console.info = console.debug = () => {};
}

/**
 * Routes that do NOT require authentication (`false` = public).
 *
 * This is a MULTI-ORGANIZATION app (docs/auth-model.md, architecture B — the
 * os.ibl.ai model): anyone with an ibl.ai account signs in and lands in their
 * default organization; the profile dropdown switches between the orgs they
 * belong to; `?tenant=<org>` on any URL re-authenticates into that org.
 */
const PUBLIC_ROUTES = new Map<RegExp, () => Promise<boolean>>([
  [new RegExp("^/sso-login"), async () => false],
  // The wallet's outward-facing pages: an employer opens a public wallet or
  // a verify link without an account.
  [new RegExp("^/p/"), async () => false],
  [new RegExp("^/verify/"), async () => false],
]);

function isLocalHost(): boolean {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1" || h === "[::1]" || h.endsWith(".localhost");
}

function seedDemoSession() {
  try {
    if (!localStorage.getItem("userData")) {
      localStorage.setItem(
        "userData",
        JSON.stringify({
          user_nicename: "jordan.rivera",
          user_email: "jordan.rivera@example.com",
          user_fullname: "Jordan Rivera",
        }),
      );
    }
    const key = "demo-wallet";
    // `localStorage.demo_admin = "1"` previews the Admin mode of the shell on the sample data.
    const demoAdmin = localStorage.getItem("demo_admin") === "1";
    localStorage.setItem(
      "tenants",
      JSON.stringify([{ key, org: key, platform_name: "Demo organization", is_admin: demoAdmin }]),
    );
    localStorage.setItem("app_tenant", key);
    localStorage.setItem("tenant", key);
    localStorage.setItem("current_tenant", key);
  } catch {}
}

export function IblaiProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // `?tenant=<org>` pins the app to that org (the OS puts it in the path;
  // here it is a query parameter so every route keeps its shape). The
  // TenantProvider below re-authenticates when the session is for another org.
  const requestedParam = searchParams?.get("tenant") ?? "";
  if (
    typeof window !== "undefined" &&
    requestedParam &&
    localStorage.getItem("app_tenant") !== requestedParam
  ) {
    setAppTenant(requestedParam);
  }

  // initializeDataLayer MUST be called synchronously before any children
  // render so that Config.lmsUrl / Config.dmUrl are set before RTK Query
  // hooks (e.g. inside the Profile component) fire their first queries.
  // useState initializer runs during the render cycle, not after it.
  const [isInitialized] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      // data-layer v1.2+ signature:
      // (dmUrl, lmsUrl, legacyLmsUrl, storageService, httpErrorHandler)
      initializeDataLayer(
        config.dmUrl(),
        config.lmsUrl(),
        // Dedicated edX host (learn.*) — NOT lmsUrl: on hosted defaults that
        // is the consolidated API path (api.iblai.app/lms), and the
        // legacy-LMS endpoints + edX iframes live on the real LMS host.
        config.legacyLmsUrl(),
        storageService,
        {
          // Demo mode has no session to refresh: never bounce to the Auth SPA.
          401: () =>
            config.demoMode() ? undefined : redirectToAuthSpa(undefined, undefined, true),
        },
      );
    } catch (e) {
      console.error("[ibl.ai] initializeDataLayer failed:", e);
    }
    return true;
  });

  // `isInitialized` is false during SSR but true on the client's first render,
  // so gating the tree on it alone makes server and client markup disagree and
  // React throws a hydration mismatch on every route. Gate on a mount flag
  // instead: server and first client render both produce LOADING, and the tree
  // appears on the next commit. The data layer is still initialized
  // synchronously above, before any child can fire a query.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const username = useMemo(() => {
    if (!isInitialized || typeof window === "undefined") return "";
    try {
      const raw = localStorage.getItem("userData");
      if (raw) return JSON.parse(raw).user_nicename ?? "";
    } catch {
      /* ignore */
    }
    return "";
  }, [isInitialized]);

  // Tenant resolution: .env -> app_tenant -> localStorage tenant
  const tenantKey = useMemo(() => (isInitialized ? resolveAppTenant() : ""), [isInitialized]);

  const isSsoRoute = pathname?.startsWith("/sso-login") ?? false;

  // Cross-SPA cookie sync on real hosts only: localhost shares cookies across every dev
  // server, and on the shared vibe zone (*.iblai.me) the parent domain is not ours.
  const enableStorageSync =
    typeof window !== "undefined" &&
    !isLocalHost() &&
    !window.location.hostname.endsWith(".iblai.me");

  const LOADING = <LoadingScreen />;

  if (!isInitialized || !mounted) return LOADING;

  // Demo mode: no organization, no sign-in. Seed the session the layout reads
  // and skip the auth/tenant providers; the SDK data hooks are never mounted
  // (the wallet reads lib/wallet/demo-data.ts instead).
  if (config.demoMode()) {
    seedDemoSession();
    return (
      <ReduxProvider store={iblaiStore}>
        <RadixPointerEventsGuard />
        <Toaster />
        {children}
      </ReduxProvider>
    );
  }

  // No org at all (no session yet and no community org configured) means
  // misconfiguration: say so instead of bouncing through the login page.
  if (!tenantKey && !isSsoRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p role="alert" className="text-destructive max-w-md p-8 text-sm">
          NEXT_PUBLIC_MAIN_TENANT_KEY is still a placeholder. For a multi-organization app set it to{" "}
          <code>main</code> (the community org) in .env.local and restart, or remove it.
        </p>
      </div>
    );
  }

  return (
    <ReduxProvider store={iblaiStore}>
      {/* Recovery for the SDK prompt-gallery teardown defect; see the file. */}
      <RadixPointerEventsGuard />
      <Toaster />
      {/* The SDK <Chat> registers public/sw.js for offline caching in Tauri. */}
      <ServiceWorkerProvider basePath="">
        <AuthProvider
          skip={isSsoRoute}
          redirectToAuthSpa={redirectToAuthSpa}
          username={username}
          pathname={pathname ?? "/"}
          storageService={storageService}
          middleware={PUBLIC_ROUTES}
          enableStorageSync={enableStorageSync}
          fallback={LOADING}
        >
          <TenantProvider
            skip={isSsoRoute}
            currentTenant={tenantKey}
            requestedTenant={tenantKey}
            saveCurrentTenant={(t: any) => {
              const key = typeof t === "string" ? t : (t?.key ?? String(t));
              localStorage.setItem("current_tenant", key);
              localStorage.setItem("tenant", key);

              // If the SDK resolved a different tenant than what the app
              // expects, redirect to re-login for the correct tenant.
              checkTenantMismatch();
            }}
            saveUserTenants={(t: unknown) => localStorage.setItem("tenants", JSON.stringify(t))}
            // TenantProvider re-authenticates against the requested tenant and
            // hands back a fresh, tenant-scoped token pair. Without persisting it
            // the next membership check still runs on the pre-switch tokens, so
            // the provider loops on
            //   "User still does not belong to tenant after re-auth"
            // and the app never leaves its loading state. iblai/os wires these up
            // (providers/index.tsx -> saveUserTokens).
            saveUserTokens={(tokens: TokenResponse) => {
              if (tokens?.axd_token) {
                localStorage.setItem("axd_token", tokens.axd_token.token);
                localStorage.setItem("axd_token_expires", tokens.axd_token.expires);
              }
              if (tokens?.dm_token) {
                localStorage.setItem("dm_token", tokens.dm_token.token);
                localStorage.setItem("dm_token_expires", tokens.dm_token.expires);
              }
            }}
            saveTenant={(t: string) => localStorage.setItem("tenant", t)}
            // A custom domain maps a hostname to an org (os.ibl.ai feature).
            // On a local host the lookup only stalls the first paint for ~30s.
            skipCustomDomainCheck={isLocalHost()}
            onAuthFailure={(reason: string) =>
              console.error("[TenantProvider] Auth failure:", reason)
            }
            handleTenantSwitch={async () => {
              await switchTenant(resolveAppTenant());
            }}
            redirectToAuthSpa={redirectToAuthSpa}
            username={username}
            fallback={LOADING}
          >
            {children}
          </TenantProvider>
        </AuthProvider>
      </ServiceWorkerProvider>
    </ReduxProvider>
  );
}
