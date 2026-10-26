/**
 * Pure helpers for the app's metadata namespace (`metadata.apps[APP_SLUG]`).
 * No React, no SDK — unit-tested in __tests__/metadata.test.ts and shared by
 * lib/iblai/metadata.ts (browser hooks).
 */

/** Keys under which this app's data lives: `metadata.apps[APP_SLUG]`. Fixed, so no env change moves the data. */
export const APP_SLUG = "credential-wallet";

export type Metadata = Record<string, unknown>;

export function readAppNamespace(metadata: unknown): Metadata {
  const apps = (metadata as { apps?: Record<string, unknown> } | null)?.apps;
  const mine = apps?.[APP_SLUG];
  return mine && typeof mine === "object" ? (mine as Metadata) : {};
}

/** Merge `patch` into `metadata.apps[APP_SLUG]`, dropping `remove` keys, without touching anything else. */
export function mergeAppNamespace(
  metadata: unknown,
  patch: Metadata,
  remove: string[] = [],
): Metadata {
  const root = metadata && typeof metadata === "object" ? { ...(metadata as Metadata) } : {};
  const apps = { ...(root.apps as Record<string, unknown> | undefined) };
  const mine: Metadata = { ...readAppNamespace(root), ...patch };
  for (const k of remove) delete mine[k];
  apps[APP_SLUG] = mine;
  root.apps = apps;
  return root;
}

/** The platform's own default agent (`overall_default_mentor`, an object or its JSON), or "". */
export function platformDefaultAgentId(metadata: unknown): string {
  let value = (metadata as { overall_default_mentor?: unknown } | null)?.overall_default_mentor;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return "";
    }
  }
  const id = (value as { unique_id?: unknown } | null)?.unique_id;
  return typeof id === "string" ? id : "";
}
