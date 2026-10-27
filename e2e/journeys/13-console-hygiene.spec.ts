import { test, expect } from "../fixtures/wallet-test";
import { gotoApp } from "../utils/app";

/**
 * Journey 13 — Console hygiene: every page loads without a console error or
 * an uncaught exception (two platform reads the SDK makes answer 4xx on a
 * new account and are allowed), and no session token ever reaches the
 * console. The token comparison runs inside the browser; its value never
 * crosses to the runner.
 */
const ROUTES = [
  "/",
  "/credentials",
  "/credentials/import",
  "/skills",
  "/resume",
  "/share",
  "/coach",
  "/agents",
  "/profile",
  "/notifications",
  "/account",
  "/admin/users",
  "/admin/analytics",
  "/admin/organization",
  "/admin/credentials",
  "/admin/billing",
  "/admin/memory",
];
// Platform answers the SDK and the shell provoke on a new organization, not app errors:
// two per-user reads the SDK makes answer 4xx; the organization has no logo yet, so the
// next/image requests for it 404; the assignments list answers 403 for an empty set
// (documented on /admin/credentials); the SDK Profile renders a <script>, which React
// reports once in development.
const ALLOWED = [
  /career\/resume/,
  /catalog\/skills\/desired/,
  /_next\/image\?url=.*(?:dark-mode-logo|logo)%2F/,
  /credentials\/orgs\/[^/]+\/users\/[^/]+\/assignments\/users\//,
  /Encountered a script tag while rendering React component/,
  // The platform throttles the organization-metadata reads the SDK panels repeat on a fast walk.
  /status of 429/,
];

test.describe("Journey 13: Console hygiene — Admin", () => {
  // con-01
  test("admin opens every page without a console error or an uncaught exception", async ({
    page,
  }) => {
    test.setTimeout(300_000);
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(`${page.url()} ${m.location().url} ${m.text()}`);
    });
    page.on("pageerror", (e) => errors.push(`${page.url()} uncaught: ${e.message}`));
    for (const path of ROUTES) await gotoApp(page, path);
    expect(errors.filter((e) => !ALLOWED.some((re) => re.test(e)))).toEqual([]);
  });

  // con-02
  test("admin's session tokens never appear in the console", async ({ page }) => {
    const texts: string[] = [];
    page.on("console", (m) => texts.push(m.text()));
    await gotoApp(page, "/");
    // fixme: in development the SDK's auth logging ([auth-redirect], [AuthProvider]) prints the
    // session tokens; the production console no-op in providers/iblai-providers.tsx silences it,
    // so this holds only against `pnpm start`. Reported to the SDK; see the knowledge base.
    test.fixme(
      (await page.locator("nextjs-portal").count()) > 0,
      "next dev: the SDK's development logging prints the session tokens",
    );
    for (const path of ["/credentials", "/resume", "/share"]) await gotoApp(page, path);
    // Compared in the browser; a hit is reported with the value masked, never the value.
    const leaks = await page.evaluate(
      (msgs) =>
        ["dm_token", "axd_token", "edx_jwt_token"].flatMap((key) => {
          const value = localStorage.getItem(key) ?? "";
          if (value.length <= 8) return [];
          return msgs
            .filter((m) => m.includes(value))
            .map((m) => `${key} in: ${m.split(value).join("<token>").slice(0, 240)}`);
        }),
      texts,
    );
    expect(leaks).toEqual([]);
  });
});
