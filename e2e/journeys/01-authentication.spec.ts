import { test, expect } from "../fixtures/wallet-test";
import { APP_HOST, AUTH_HOST } from "../fixtures/test-data";
import { gotoApp, gotoBare } from "../utils/app";

/**
 * Journey 1 — Authentication: a signed-out visitor is sent to the Auth SPA,
 * the public pages stay public, and a signed-in session follows the SDK's
 * storage contract (`tenant` is the key, `current_tenant` its record), and a
 * session the $0 checkout left on `main` moves to the user's own organization.
 * The Auth SPA is answered by a stub route, so no real sign-in or logout runs.
 */
const MAIN = process.env.NEXT_PUBLIC_MAIN_TENANT_KEY || "main";
const loginUrl = /\/login\?app=mentor&redirect-to=/;
const authStub = { contentType: "text/html", body: "<title>auth stub</title>" };

test.describe("Journey 1: Authentication — Public", () => {
  test.beforeEach(async ({ publicPage }) => {
    await publicPage.route(`${AUTH_HOST}/**`, (route) => route.fulfill(authStub));
  });

  // auth-01
  test("visitor goes to the wallet and is sent to the Auth SPA login", async ({ publicPage }) => {
    await publicPage.goto(APP_HOST);
    await publicPage.waitForURL(loginUrl, { timeout: 30_000 });
    expect(publicPage.url().startsWith(AUTH_HOST)).toBe(true);
  });

  // auth-02
  test("visitor goes to a wallet page and is redirected, while the public pages stay", async ({
    publicPage,
  }) => {
    await publicPage.goto(`${APP_HOST}/credentials`);
    await publicPage.waitForURL(loginUrl, { timeout: 30_000 });
    await gotoBare(publicPage, "/p/nobody/nobody");
    await expect(publicPage.getByRole("heading", { name: "No public wallet here" })).toBeVisible();
    await gotoBare(publicPage, "/verify/nothing");
    await expect(publicPage.getByRole("heading", { level: 1 })).toHaveText("Nothing to verify");
    expect(publicPage.url().startsWith(APP_HOST)).toBe(true);
  });
});

test.describe("Journey 1: Authentication — Admin", () => {
  // auth-03
  test("admin lands signed in with the SDK's storage contract", async ({ page, shell }) => {
    await gotoApp(page, "/");
    await expect(shell.title).toHaveText("Wallet");
    const contract = await page.evaluate(() => {
      const tenant = localStorage.getItem("tenant") ?? "";
      const tenants = JSON.parse(localStorage.getItem("tenants") ?? "[]") as { key: string }[];
      let current: { key?: string } | null = null;
      try {
        current = JSON.parse(localStorage.getItem("current_tenant") ?? "null");
      } catch {
        current = null;
      }
      return {
        signedIn: !!localStorage.getItem("dm_token"),
        tenantIsKey: !!tenant && !tenant.startsWith("{"),
        currentMatches: !!current && typeof current === "object" && current.key === tenant,
        currentListed: tenants.some((t) => t.key === tenant),
        pinned: localStorage.getItem("app_tenant"),
      };
    });
    expect(contract).toEqual({
      signedIn: true,
      tenantIsKey: true,
      currentMatches: true,
      currentListed: true,
      pinned: null,
    });
  });

  // auth-04
  test("admin opens a link with ?tenant= for their own organization and it pins it", async ({
    page,
    shell,
  }) => {
    await gotoApp(page, "/");
    const tenant = await page.evaluate(() => localStorage.getItem("tenant") ?? "");
    expect(tenant).not.toBe("");
    await gotoApp(page, `/credentials?tenant=${encodeURIComponent(tenant)}`);
    await expect(shell.title).toHaveText("Credentials");
    expect(await page.evaluate(() => localStorage.getItem("app_tenant"))).toBe(tenant);
  });

  // auth-05
  test("admin logs out from More options and the session is gone", async ({ page, shell }) => {
    await page.route(`${AUTH_HOST}/**`, (route) => route.fulfill(authStub));
    await gotoApp(page, "/");
    await shell.moreOptions.click();
    await page.getByRole("menuitem", { name: /log ?out/i }).click();
    await page.waitForURL(/\/logout\?app=mentor&redirect-to=/, { timeout: 30_000 });
    await page.goto(APP_HOST);
    await page.waitForURL(loginUrl, { timeout: 30_000 });
  });

  // auth-06
  test("admin back from the $0 checkout on main's session is moved to their own organization", async ({
    page,
  }) => {
    await page.route(`${AUTH_HOST}/**`, (route) => route.fulfill(authStub));
    await gotoApp(page, "/");
    const { own, keys } = await page.evaluate(() => ({
      own: localStorage.getItem("tenant") ?? "",
      keys: (JSON.parse(localStorage.getItem("tenants") ?? "[]") as { key: string }[]).map(
        (t) => t.key,
      ),
    }));
    // The SDK's two-platform rule: a user holding exactly [main, X] is moved to X.
    expect(keys.sort()).toEqual([MAIN, own].sort());
    // What the checkout returns to: the session still on main while the platform lists both.
    await page.evaluate((main) => {
      const entry = { key: main, org: main, platform_name: "ibl.ai", is_admin: false };
      localStorage.setItem("tenant", main);
      localStorage.setItem("current_tenant", JSON.stringify(entry));
      localStorage.setItem("tenants", JSON.stringify([entry]));
    }, MAIN);
    await page.goto(APP_HOST);
    await page.waitForURL(/\/login\/complete\?/, { timeout: 30_000 });
    expect(new URL(page.url()).searchParams.get("tenant")).toBe(own);
  });
});
