/**
 * Sharing a credential the way earners expect from Credly and the WGU
 * Achievement Wallet: one-click "Add to LinkedIn profile", a public
 * verification link, an email / copy-ready blurb, and an embed snippet.
 */
import type { WalletCredential } from "./types";

/**
 * LinkedIn's "Add to profile" deep link (Licenses & certifications). The same
 * URL Credly builds behind its LinkedIn button; nothing is posted — LinkedIn
 * opens a pre-filled form the member reviews and saves.
 */
export function linkedInAddToProfileUrl(c: WalletCredential, verifyUrl?: string): string {
  const issued = c.issuedOn ? new Date(c.issuedOn) : undefined;
  const expires = c.expires ? new Date(c.expires) : undefined;
  const p = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: c.name,
    organizationName: c.issuer.name,
  });
  if (issued && !Number.isNaN(issued.getTime())) {
    p.set("issueYear", String(issued.getUTCFullYear()));
    p.set("issueMonth", String(issued.getUTCMonth() + 1));
  }
  if (expires && !Number.isNaN(expires.getTime())) {
    p.set("expirationYear", String(expires.getUTCFullYear()));
    p.set("expirationMonth", String(expires.getUTCMonth() + 1));
  }
  const cert = verifyUrl ?? c.verification.url;
  if (cert) p.set("certUrl", cert);
  if (c.verification.level === "platform" || c.source === "imported") p.set("certId", c.id.slice(0, 120));
  return `https://www.linkedin.com/profile/add?${p.toString()}`;
}

export function linkedInShareUrl(url: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

export function xShareUrl(text: string, url: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

export function mailtoShare(c: WalletCredential, url: string): string {
  const subject = `${c.name} — ${c.issuer.name}`;
  const body = `${shareBlurb(c, url)}\n\nVerify: ${url}`;
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function shareBlurb(c: WalletCredential, url?: string): string {
  const when = c.issuedOn ? ` on ${new Date(c.issuedOn).toLocaleDateString(undefined, { year: "numeric", month: "long" })}` : "";
  const skills = c.skills.length ? ` Skills: ${c.skills.slice(0, 6).join(", ")}.` : "";
  return `I earned ${c.name} from ${c.issuer.name}${when}.${skills}${url ? ` Verify it here: ${url}` : ""}`;
}

/** The public verify page for a credential on this wallet. */
export function verifyPath(c: WalletCredential): string {
  return `/verify/${encodeURIComponent(c.id)}`;
}

export function absoluteUrl(path: string): string {
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

export function embedSnippet(c: WalletCredential, verifyUrl: string): string {
  const img = c.image ? `<img src="${c.image}" alt="${escapeHtml(c.name)}" width="120" height="120" style="display:block;margin-bottom:8px;border-radius:12px" />` : "";
  return `<a href="${verifyUrl}" target="_blank" rel="noopener" style="font:14px/1.4 system-ui,sans-serif;color:#0058cc;text-decoration:none">${img}<strong>${escapeHtml(c.name)}</strong><br/>${escapeHtml(c.issuer.name)} · verified credential</a>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch] as string);
}

export function handleFromName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

export const HANDLE_RE = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])?$/;

// ---------- share links that carry what the viewer needs ----------
//
// Nothing about a wallet lives on a server of ours. A public link therefore
// carries, in its URL fragment (never sent to any server), the public-safe
// snapshot the viewer needs: who the holder is, the ids of the platform-issued
// credentials (which the viewer's browser then verifies live against ibl.ai's
// public assertion endpoint) and the summaries of imported / self-reported
// ones (shown with their verification level and the issuer's link).

export interface SharedCredential {
  id: string;
  name: string;
  kind: WalletCredential["kind"];
  issuer: { name: string; url?: string; image?: string };
  issuedOn?: string;
  expires?: string;
  image?: string;
  skills: string[];
  description?: string;
  criteria?: string;
  verification: { level: WalletCredential["verification"]["level"]; url?: string };
  source: WalletCredential["source"];
}

export interface ShareSnapshot {
  v: 1;
  org: string;
  username: string;
  profile: { name: string; headline?: string; location?: string; about?: string; image?: string; links?: { label: string; url: string }[] };
  /** Platform-issued credentials: verified live by the viewer's browser. */
  platformIds: string[];
  /** Everything else, summarized. */
  credentials: SharedCredential[];
  collections?: { id: string; name: string; description?: string; credentialIds: string[] }[];
  targetRoleId?: string;
}

const clip = (s: string | undefined, n: number) => (s && s.length > n ? `${s.slice(0, n - 1)}…` : s);

export function summarizeCredential(c: WalletCredential): SharedCredential {
  return {
    id: c.id,
    name: c.name,
    kind: c.kind,
    issuer: { name: c.issuer.name, url: c.issuer.url, image: c.issuer.image },
    issuedOn: c.issuedOn,
    expires: c.expires,
    image: c.image,
    skills: c.skills.slice(0, 12),
    description: clip(c.description, 280),
    criteria: clip(c.criteria, 200),
    verification: { level: c.verification.level, url: c.verification.url },
    source: c.source,
  };
}

/** base64url of UTF-8 JSON — safe inside a URL fragment. */
export function encodeFragment(data: unknown): string {
  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeFragment<T>(s: string): T | null {
  try {
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4);
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as T;
  } catch {
    return null;
  }
}

/** The fragment of the current page (`#d=…` / `#c=…`), decoded. */
export function readFragment<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const m = new RegExp(`(?:^#|&)${key}=([^&]+)`).exec(window.location.hash);
  return m ? decodeFragment<T>(m[1]) : null;
}

/** `/verify/<id>` — platform ids verify on their own; anything else carries its summary. */
export function verifyLink(c: WalletCredential, origin: string, holder: { org: string; username: string }): string {
  const base = `${origin}/verify/${encodeURIComponent(c.id)}?org=${encodeURIComponent(holder.org)}&u=${encodeURIComponent(holder.username)}`;
  if (c.source === "platform") return base;
  return `${base}#c=${encodeFragment({ v: 1, holder: holder.username, credential: summarizeCredential(c) })}`;
}

/** `/p/<org>/<username>#d=…` — the public wallet page, self-contained. */
export function publicPageLink(snapshot: ShareSnapshot, origin: string, collectionId?: string): string {
  const base = `${origin}/p/${encodeURIComponent(snapshot.org)}/${encodeURIComponent(snapshot.username)}`;
  const query = collectionId ? `?collection=${encodeURIComponent(collectionId)}` : "";
  return `${base}${query}#d=${encodeFragment(snapshot)}`;
}
