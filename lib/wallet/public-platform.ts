/**
 * ibl.ai's public, unauthenticated reads, called from the viewer's browser.
 * `GET /dm/api/credentials/public/assertions/{id}/` answers for any
 * platform-issued credential — 404 when it does not exist or was revoked.
 */
import config from "../iblai/config";
import { fromAssertion } from "./derive";
import type { WalletCredential } from "./types";

export type PublicCheck =
  | { status: "verified"; credential: WalletCredential }
  | { status: "revoked"; reason?: string }
  | { status: "not-found" }
  | { status: "unreachable" };

export async function checkPublicAssertion(entityId: string): Promise<PublicCheck> {
  try {
    const res = await fetch(`${config.dmUrl()}/api/credentials/public/assertions/${encodeURIComponent(entityId)}/`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const body = (await res.json().catch(() => null)) as { result?: Record<string, unknown>; status?: { description?: string } } | null;
    if (res.ok && body?.result) {
      const c = fromAssertion(body.result as Parameters<typeof fromAssertion>[0]);
      return c.revoked ? { status: "revoked", reason: c.revocationReason } : { status: "verified", credential: c };
    }
    if (res.status === 404) {
      const d = body?.status?.description ?? "";
      return /revok/i.test(d) ? { status: "revoked", reason: d } : { status: "not-found" };
    }
    return { status: "unreachable" };
  } catch {
    return { status: "unreachable" };
  }
}

export async function fetchPublicAssertion(entityId: string): Promise<WalletCredential | null> {
  const r = await checkPublicAssertion(entityId);
  return r.status === "verified" ? r.credential : null;
}
