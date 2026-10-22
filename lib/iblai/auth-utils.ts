/**
 * ibl.ai auth helper utilities — the OS pattern (multi-organization).
 *
 * Sign-in goes through the hosted Auth SPA with `app=mentor` (what os.ibl.ai
 * sends, so the SPA applies the OS branding and redirect rules). No `tenant`
 * is pinned unless a caller asks for one: a user of any organization signs in
 * and lands in their default org; `TenantProvider` re-authenticates with
 * `tenant=` when the app needs a specific org the user belongs to.
 */

import { handleTenantSwitch as sdkHandleTenantSwitch } from "@iblai/iblai-js/web-utils";
import config from "./config";
import { setAppTenant } from "./tenant";

/** Check if running inside a Tauri app. */
export function isTauri(): boolean {
  if (typeof window === "undefined") return false;
  return "__TAURI_INTERNALS__" in window || "__TAURI__" in window;
}

/** Check if running inside a Tauri mobile app (iOS/Android). */
export function isTauriMobile(): boolean {
  if (!isTauri()) return false;
  return /android|iphone|ipad|ipod/i.test(navigator.userAgent);
}

/** Get the redirect origin for the Auth SPA.
 *  - Mobile Tauri: custom scheme (e.g. `iblai-skills://`)
 *  - Desktop Tauri / Web: window.location.origin
 */
function getRedirectOrigin(): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  if (isTauriMobile()) {
    const scheme = config.tauriCustomScheme();
    if (scheme) return `${scheme}://`;
  }
  return origin;
}

/** The `app` the Auth SPA is asked for; `mentor` is the OS. */
export const AUTH_APP = "mentor";

/** Redirect the browser to the ibl.ai Auth SPA for login. */
export async function redirectToAuthSpa(
  redirectTo?: string,
  platformKey?: string,
  logout?: boolean,
  saveRedirect?: boolean,
) {
  const redirectOrigin = getRedirectOrigin();
  const path = redirectTo ?? (typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/");

  if (saveRedirect) {
    localStorage.setItem("redirectTo", path);
  }

  let authUrl = `${config.authUrl()}/login?app=${AUTH_APP}&redirect-to=${encodeURIComponent(redirectOrigin)}`;
  // Multi-org: only pin a tenant when a caller asks for one (re-auth, switch).
  if (platformKey) authUrl += `&tenant=${encodeURIComponent(platformKey)}`;
  if (logout) authUrl += "&logout=1";

  // All platforms (web, desktop Tauri, mobile Tauri): navigate the window
  // to the Auth SPA.  On desktop Tauri the auth page loads in-app, and
  // the Rust on_navigation filter opens OAuth providers (Google, Apple)
  // in a popup window automatically.
  window.location.href = authUrl;
}

/** Check whether a non-expired auth token exists in localStorage. */
export function hasNonExpiredAuthToken(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("axd_token");
  if (!token) return false;
  const expiry = localStorage.getItem("axd_token_expires");
  if (!expiry) return false;
  return new Date(expiry) > new Date();
}

/**
 * Switch to another organization the user belongs to: the SDK clears
 * storage, coordinates other tabs, and re-enters through the Auth SPA with
 * `tenant=<org>` (exactly what the OS's profile dropdown does).
 */
export async function switchTenant(tenantKey: string) {
  // Never carry an explicit pin across a switch: the sign-in's answer
  // (`current_tenant`) becomes the org, and a stale pin would send requests
  // to the old org with the new org's token (401 → sign-out).
  setAppTenant("");
  await sdkHandleTenantSwitch(tenantKey, {
    authUrl: config.authUrl(),
    redirectPathStorageKey: "redirectTo",
    queryParams: { tenant: "tenant", redirectTo: "redirect-to" },
    saveRedirect: true,
  });
}

/** Handle logout: clear state and redirect to the Auth SPA logout page. */
export function handleLogout() {
  const redirectOrigin = getRedirectOrigin();
  localStorage.clear();
  window.location.href = `${config.authUrl()}/logout?app=${AUTH_APP}&redirect-to=${encodeURIComponent(redirectOrigin)}`;
}
