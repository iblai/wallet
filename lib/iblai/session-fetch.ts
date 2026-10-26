/**
 * fetch() the platform as the signed-in user from the browser: the session's
 * `dm_token` goes out as `Authorization: Token …`, exactly what the SDK's
 * data layer sends. For the few endpoints whose generated client drops a
 * path parameter (see lib/wallet/provider.tsx), or that it does not wrap.
 */
import config from "./config";

export class SessionFetchError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`Platform request failed (${status})`);
    this.name = "SessionFetchError";
  }
}

export async function sessionFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const token = typeof window === "undefined" ? "" : (localStorage.getItem("dm_token") ?? "");
  // A path is on the DM host; an absolute URL names another platform host (lib/iblai/completions.ts).
  const url = /^https?:\/\//.test(path) ? path : `${config.dmUrl()}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(token && { Authorization: `Token ${token}` }),
      ...(init.headers as Record<string, string>),
    },
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) throw new SessionFetchError(res.status, data);
  return data as T;
}
