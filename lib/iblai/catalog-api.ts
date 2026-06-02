/**
 * Catalog API client (DM service).
 *
 * Routes live under `${dmUrl}/api/catalog/...`. See
 * `iblai-dm-pro/web/ibl-dm-core-apps/ibl-dm-catalog-app/dl_catalog_app/`
 * for the authoritative serializers and views.
 *
 * Auth: `Authorization: Token <dm_token>` from localStorage.
 */

import config from "@/lib/iblai/config";

export type PathwayItemType = "course" | "program" | "resource" | "pathway";

export interface PathwayPathItem {
  item_type: PathwayItemType;
  // Set one of the following depending on item_type:
  course_id?: string;
  program_key?: string;
  resource_id?: string;
  pathway_id?: string;
  // Resource-create extras: name, url, etc. surface here too.
  [key: string]: unknown;
}

/** Per `dl_catalog_app.serializers.PathwaySerializer` (`depth=1`). */
export interface Pathway {
  id: number;
  pathway_id: string;
  pathway_uuid: string;
  name: string;
  slug: string;
  visible: boolean;
  user_id: number | null;
  username: string | null;
  platform_key: string | null;
  data: Record<string, unknown> | null;
  path: PathwayPathItem[];
}

function getDmToken(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem("dm_token") ?? "";
  } catch {
    return "";
  }
}

function authHeaders(extra: Record<string, string> = {}): HeadersInit {
  const token = getDmToken();
  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Token ${token}` } : {}),
    ...extra,
  };
}

interface ListPathwaysParams {
  /** Scope the listing to a tenant. */
  platformKey?: string;
  /** Filter to a specific owner (numeric id). */
  userId?: number;
  /** Filter to a specific owner by username. */
  username?: string;
  name?: string;
  slug?: string;
  visible?: boolean;
  signal?: AbortSignal;
}

/**
 * GET /api/catalog/pathways/
 *
 * Per `PathwayView.get`, the response is a bare JSON array — no
 * pagination wrapper. Filters supported: pathway_id, pathway_uuid,
 * user_id, username, platform_key, item_id, name, slug (iexact), visible.
 */
export async function listPathways({
  platformKey,
  userId,
  username,
  name,
  slug,
  visible,
  signal,
}: ListPathwaysParams = {}): Promise<Pathway[]> {
  const params = new URLSearchParams();
  if (platformKey) params.set("platform_key", platformKey);
  if (userId != null) params.set("user_id", String(userId));
  if (username) params.set("username", username);
  if (name) params.set("name", name);
  if (slug) params.set("slug", slug);
  if (visible != null) params.set("visible", String(visible));

  const qs = params.toString();
  const url = `${config.dmUrl().replace(/\/+$/, "")}/api/catalog/pathways/${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, { headers: authHeaders(), signal });
  if (!res.ok) throw new Error(`listPathways: HTTP ${res.status}`);
  const body = await res.json();
  if (Array.isArray(body)) return body as Pathway[];
  // Defensive fallbacks if the response gets wrapped in the future.
  if (Array.isArray(body?.results)) return body.results as Pathway[];
  if (Array.isArray(body?.data)) return body.data as Pathway[];
  if (Array.isArray(body?.result?.data)) return body.result.data as Pathway[];
  return [];
}

export interface CreatePathwayInput {
  /** Owner numeric user id — required by the DM. */
  user_id: number;
  /** Pathway display name. */
  name: string;
  /** Ordered list of pathway items. Each needs `item_type` + the id field. */
  path: PathwayPathItem[];
  /** Tenant key. */
  platform_key?: string;
  /** Provide to update an existing pathway; omit to create a new one. */
  pathway_id?: string;
  pathway_uuid?: string;
  username?: string;
  slug?: string;
  /** Default `true`. */
  visible?: boolean;
  data?: Record<string, unknown>;
}

/**
 * POST /api/catalog/pathways/
 *
 * Returns 201 on create, 200 on update. Returns the serialized Pathway.
 */
export async function createPathway(
  input: CreatePathwayInput,
  opts: { signal?: AbortSignal } = {},
): Promise<Pathway> {
  const url = `${config.dmUrl().replace(/\/+$/, "")}/api/catalog/pathways/`;
  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(input),
    signal: opts.signal,
  });
  if (!res.ok) {
    let detail = "";
    try {
      detail = JSON.stringify(await res.json());
    } catch {}
    throw new Error(`createPathway: HTTP ${res.status}${detail ? ` — ${detail}` : ""}`);
  }
  return (await res.json()) as Pathway;
}

interface DeletePathwayParams {
  pathway_id: string;
  user_id: number;
  signal?: AbortSignal;
}

/** DELETE /api/catalog/pathways/?pathway_id=...&user_id=... */
export async function deletePathway({
  pathway_id,
  user_id,
  signal,
}: DeletePathwayParams): Promise<{ count: number; type: Record<string, number> }> {
  const params = new URLSearchParams({ pathway_id, user_id: String(user_id) });
  const url = `${config.dmUrl().replace(/\/+$/, "")}/api/catalog/pathways/?${params}`;
  const res = await fetch(url, { method: "DELETE", headers: authHeaders(), signal });
  if (!res.ok) throw new Error(`deletePathway: HTTP ${res.status}`);
  return (await res.json()) as { count: number; type: Record<string, number> };
}
