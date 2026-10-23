/**
 * Decide the post-SSO landing path.
 *
 * An explicit `?redirect-path=` wins over the path SsoLogin resolved from
 * localStorage (`redirectTo`); whichever wins must be a plain same-origin
 * path (one leading slash, no `//` or `/\` authority, no control characters),
 * or the landing is `/` — both inputs reach this page from the URL, so either
 * could be an open redirect.
 */
const PLAIN_PATH = /^\/(?![/\\])/;
const plain = (p?: string | null): p is string => !!p && PLAIN_PATH.test(p) && !/\p{Cc}/u.test(p);

export function resolveSsoRedirectPath(resolvedPath: string, search: string): string {
  const explicit = new URLSearchParams(search).get("redirect-path");
  return plain(explicit) ? explicit : plain(resolvedPath) ? resolvedPath : "/";
}
