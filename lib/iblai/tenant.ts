
/**
 * Tenant resolution for ibl.ai apps.
 *
 * The current tenant lives in the SDK's `tenant` localStorage entry,
 * which the SDK TenantProvider writes via `saveCurrentTenant`.
 */

/**
 * Resolve the current tenant key from the SDK's `tenant` localStorage value.
 */
export function resolveAppTenant(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("tenant") ?? "";
}
