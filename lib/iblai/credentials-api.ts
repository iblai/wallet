/**
 * Credentials API client for the ibl.ai DM service.
 *
 * Live response shapes (verified against the DM backend at
 * `iblai-dm-pro/web/.../dl_cred_app/serializers/`):
 *
 *   - `GET /api/credentials/orgs/{platform_key}/users/{username}/`
 *     returns `{status, result: {next, previous, count, data: Credential[]}}`
 *
 *   - `GET /api/credentials/orgs/{platform_key}/users/{username}/assertions/`
 *     returns `{next, previous, count, num_pages, page_number, max_page_size, data: Assertion[]}`
 *
 * The OpenAPI schema at `https://api.iblai.app/dm/api/docs/schema/` is
 * inaccurate for these endpoints (lists fields as snake_case, omits the
 * status/result wrapper for credentials). Treat the serializers as the
 * source of truth.
 *
 * Auth: `Authorization: Token <dm_token>` where dm_token is in localStorage
 * (set by the SDK's AuthProvider when the user signs in).
 */

import config from "@/lib/iblai/config";

export interface CredentialImage {
  url: string;
}

/** Per `dl_cred_app/serializers/credential.py::CredentialSerializer`. */
export interface Credential {
  entityId: string;
  name: string;
  name_override: string | null;
  description: string | null;
  criteriaUrl: string | null;
  criteriaNarrative: string | null;
  createdAt: string; // ISO date-time
  iconImage: string | null;
  icon_image_id: number | null;
  backgroundImage: string | null;
  background_image_id: number | null;
  thumbnailImage: string | null;
  thumbnail_image_id: number | null;
  catalog_items: string[];
  courses: { name: string; course_id: string }[];
  programs: { name: string; program_id: string }[];
  pathways: { name: string; pathway_id: string }[];
  issuerDetails: Record<string, string> | null;
  html_template: string | null;
  css_template: string | null;
  metadata: unknown;
  credentialType: string | null;
  expires: { amount: number; duration: string } | null;
  tags: string[];
  signatories: Record<string, string>[];
  signal: string | null;
}

/** Per `dl_cred_app/serializers/assertion.py::AssertionSerializer`. */
export interface Assertion {
  entityId: string;
  issuedOn: string;
  credentialDetails: Credential;
  recipient: { username: string; name?: string };
  metadata: unknown;
  course: { name: string; course_id: string } | null;
  program: { name: string; program_id: string } | null;
  narrative: string | null;
  revoked: boolean;
  revocationReason: string | null;
  acceptance: string;
  expires: string;
}

export interface PaginatedAssertionsResponse {
  next: string | null;
  previous: string | null;
  count: number;
  num_pages: number;
  page_number: number;
  max_page_size: number;
  data: Assertion[];
}

export interface PaginatedCredentialsResult {
  next: string | null;
  previous: string | null;
  count: number;
  data: Credential[];
}

function getDmToken(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem("dm_token") ?? "";
  } catch {
    return "";
  }
}

function authHeaders(): HeadersInit {
  const token = getDmToken();
  return token
    ? { Authorization: `Token ${token}`, Accept: "application/json" }
    : { Accept: "application/json" };
}

interface GetCredentialParams {
  platformKey: string;
  username: string;
  entityId: string;
  signal?: AbortSignal;
}

/**
 * GET /api/credentials/orgs/{platform_key}/users/{username}/{entity_id}
 * Returns a single credential (badge class) by its entityId.
 * Response is wrapped as `{status, result: Credential}`.
 */
export async function getCredential({
  platformKey,
  username,
  entityId,
  signal,
}: GetCredentialParams): Promise<Credential | null> {
  if (!platformKey || !username || !entityId) return null;
  const url = `${config.dmUrl().replace(/\/+$/, "")}/api/credentials/orgs/${encodeURIComponent(
    platformKey,
  )}/users/${encodeURIComponent(username)}/${encodeURIComponent(entityId)}`;

  const res = await fetch(url, { headers: authHeaders(), signal });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`getCredential: HTTP ${res.status}`);
  const body = await res.json();
  if (body?.result?.entityId) return body.result as Credential;
  if (body?.entityId) return body as Credential;
  return null;
}

interface ListCredentialsParams {
  platformKey: string;
  username: string;
  page?: number;
  pageSize?: number; // default 10, max 100 per backend
  search?: string;
  course?: string;
  program?: string;
  signal?: AbortSignal;
}

export async function listCredentials({
  platformKey,
  username,
  page,
  pageSize,
  search,
  course,
  program,
  signal,
}: ListCredentialsParams): Promise<PaginatedCredentialsResult> {
  const empty: PaginatedCredentialsResult = {
    next: null,
    previous: null,
    count: 0,
    data: [],
  };
  if (!platformKey || !username) return empty;

  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (pageSize) params.set("page_size", String(pageSize));
  if (search) params.set("search", search);
  if (course) params.set("course", course);
  if (program) params.set("program", program);

  const qs = params.toString();
  const url = `${config.dmUrl().replace(/\/+$/, "")}/api/credentials/orgs/${encodeURIComponent(
    platformKey,
  )}/users/${encodeURIComponent(username)}/${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, { headers: authHeaders(), signal });
  if (!res.ok) throw new Error(`listCredentials: HTTP ${res.status}`);
  const body = await res.json();

  // Canonical shape: {status, result: {next, previous, count, data: [...]}}
  if (body?.result?.data && Array.isArray(body.result.data)) {
    return {
      next: body.result.next ?? null,
      previous: body.result.previous ?? null,
      count: body.result.count ?? body.result.data.length,
      data: body.result.data as Credential[],
    };
  }
  // Fallbacks for tolerance against future API tweaks.
  if (Array.isArray(body?.data)) {
    return { ...empty, count: body.count ?? body.data.length, data: body.data };
  }
  if (Array.isArray(body?.results)) {
    return { ...empty, count: body.count ?? body.results.length, data: body.results };
  }
  if (Array.isArray(body)) return { ...empty, count: body.length, data: body };
  return empty;
}

interface ListAssertionsParams {
  platformKey: string;
  username: string;
  page?: number;
  pageSize?: number; // max 1000 per backend
  course?: string;
  includeExpired?: boolean;
  includeRevoked?: boolean;
  excludeMainTenantAssertions?: boolean;
  signal?: AbortSignal;
}

export async function listAssertions({
  platformKey,
  username,
  page,
  pageSize,
  course,
  includeExpired,
  includeRevoked,
  excludeMainTenantAssertions,
  signal,
}: ListAssertionsParams): Promise<PaginatedAssertionsResponse> {
  const empty: PaginatedAssertionsResponse = {
    next: null,
    previous: null,
    count: 0,
    num_pages: 0,
    page_number: 0,
    max_page_size: 0,
    data: [],
  };
  if (!platformKey || !username) return empty;

  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (pageSize) params.set("page_size", String(pageSize));
  if (course) params.set("course", course);
  if (includeExpired) params.set("include_expired", "true");
  if (includeRevoked) params.set("include_revoked", "true");
  if (excludeMainTenantAssertions) params.set("exclude_main_tenant_assertions", "true");

  const qs = params.toString();
  const url = `${config.dmUrl().replace(/\/+$/, "")}/api/credentials/orgs/${encodeURIComponent(
    platformKey,
  )}/users/${encodeURIComponent(username)}/assertions/${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, { headers: authHeaders(), signal });
  if (!res.ok) throw new Error(`listAssertions: HTTP ${res.status}`);
  const body = await res.json();

  // Canonical shape (direct, no status/result wrapper):
  //   {next, previous, count, num_pages, page_number, max_page_size, data: [...]}
  if (Array.isArray(body?.data)) return body as PaginatedAssertionsResponse;
  if (body?.result?.data && Array.isArray(body.result.data)) {
    return { ...empty, ...body.result };
  }
  if (Array.isArray(body?.results)) {
    return { ...empty, count: body.count ?? body.results.length, data: body.results };
  }
  if (Array.isArray(body)) return { ...empty, count: body.length, data: body };
  return empty;
}
