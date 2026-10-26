/**
 * Tenant (organization) resolution — MULTI-ORGANIZATION (the os.ibl.ai model,
 * docs/auth-model.md architecture B).
 *
 * Users of any organization sign in; the Auth SPA returns them to their
 * default org (`current_tenant` in the SSO payload), and they can switch
 * between the orgs they belong to (`tenants`). The community org (`main`)
 * is only a last resort for a visitor with no session yet.
 *
 * Priority:
 *   1. app_tenant — an explicit choice in this app (switcher, `?tenant=`),
 *      unless the session's `tenants` disown it (a stale pin)
 *   2. current_tenant / tenant — what the sign-in handed the browser
 *   3. NEXT_PUBLIC_MAIN_TENANT_KEY — the community org (`main`), as fallback
 */

// Relative import (not @/): vitest resolves no alias for lib files.
import config from "./config";

const PLACEHOLDER_PLATFORMS = new Set([
  "your-main-platform",
  "your-platform",
  "your-tenant",
  "your-tenant-key",
  "test-tenant",
  "",
]);

/**
 * The org pinned in this app (switcher, `?tenant=`), or "". A pin the session's
 * `tenants` disown is stale — a demo run, another account's switch — and is
 * dropped here rather than left to outrank the sign-in on every request.
 */
function pinnedTenant(): string {
  const pinned = localStorage.getItem("app_tenant");
  if (!pinned) return "";
  const tenants = readTenants();
  if (!tenants.length || tenants.some((t) => t.key === pinned)) return pinned;
  setAppTenant("");
  return "";
}

/** The org this app is currently working in. */
export function resolveAppTenant(): string {
  if (typeof window === "undefined") return "";

  // 1. An explicit choice made in this app (tenant switch, ?tenant=).
  const appTenant = pinnedTenant();
  if (appTenant) return appTenant;

  // 2. The sign-in's answer: the user's default org, or the one re-authed into.
  //    SsoLogin stores `current_tenant` as the whole tenant object; the SDK's
  //    TenantProvider later stores just the key. Accept both.
  const current =
    tenantKeyOf(localStorage.getItem("current_tenant")) ||
    tenantKeyOf(localStorage.getItem("tenant"));
  if (current) return current;

  // 3. The community org, until someone signs in.
  const envTenant = config.mainTenantKey();
  if (envTenant && !PLACEHOLDER_PLATFORMS.has(envTenant)) return envTenant;

  return "";
}

/** A stored tenant value → its key: a bare key, or the JSON of a tenant object. */
export function tenantKeyOf(raw: string | null): string {
  if (!raw || raw === "null" || raw === "undefined") return "";
  if (raw.startsWith("{")) {
    try {
      const o = JSON.parse(raw) as { key?: string; org?: string };
      return o.key ?? o.org ?? "";
    } catch {
      return "";
    }
  }
  return raw;
}

/** Pin the app to an org the user picked (switcher / `?tenant=`). */
export function setAppTenant(key: string) {
  if (typeof window === "undefined") return;
  if (key) localStorage.setItem("app_tenant", key);
  else localStorage.removeItem("app_tenant");
}

/**
 * Check if the SDK's current tenant matches the app's resolved tenant.
 *
 * If they differ, redirect to the auth SPA to re-login for the correct
 * tenant. Returns `true` if a redirect was triggered (caller should stop
 * rendering).
 */
export function checkTenantMismatch(): boolean {
  if (typeof window === "undefined") return false;

  const appTenant = pinnedTenant();
  const sdkTenant = tenantKeyOf(localStorage.getItem("tenant"));

  if (appTenant && sdkTenant && sdkTenant !== appTenant) {
    // Use dynamic import to avoid hard dependency on auth-utils from tenant module.
    import("./auth-utils").then(({ redirectToAuthSpa }) => {
      redirectToAuthSpa(undefined, appTenant, false, false);
    });
    return true;
  }
  return false;
}

export type TenantEntry = { key: string; is_admin?: boolean; [k: string]: unknown };

/** The orgs the sign-in handed the browser (`tenants`), or [] when signed out. */
export function readTenants(): TenantEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem("tenants") ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Whether the signed-in user is an admin of the app's current org, read from
 * the `tenants` list SsoLogin / TenantProvider persist. Deliberately NOT the
 * SDK's `useIsAdmin()`: that answers for the SDK's *current* tenant, which can
 * differ from the org this app resolved.
 */
export function isTenantAdmin(): boolean {
  return !!readTenants().find((t) => t.key === resolveAppTenant())?.is_admin;
}
