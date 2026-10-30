import { test, expect } from "../fixtures/wallet-test";
import { AUTH_HOST } from "../fixtures/test-data";
import { esc, gotoApp } from "../utils/app";

/**
 * Journey 2 — Shell & navigation: the sidebar rows, the primary action, the
 * collapse toggle, the top bar's bell, avatar menu and credit balance, the
 * footer cluster's dialogs, and the User/Admin switch.
 */
const ROWS: [string, string, string][] = [
  ["Credentials", "/credentials", "Credentials"],
  ["Skills", "/skills", "Skills"],
  ["Résumé", "/resume", "Résumé"],
  ["Share", "/share", "Share"],
  ["Coach", "/coach", "Coach"],
  ["Wallet", "/", "Wallet"],
];

test.describe("Journey 2: Shell & Navigation — Admin", () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page, "/");
  });

  // nav-01
  test("admin goes through every sidebar row and each lands on its page", async ({ shell }) => {
    for (const [label, path, title] of ROWS) {
      await shell.open(label, path);
      await expect(shell.title).toHaveText(title);
    }
  });

  // nav-02
  test("admin clicks Add credential and lands on the import page", async ({ page, shell }) => {
    await shell.addCredential.click();
    await page.waitForURL((url) => url.pathname === "/credentials/import", { timeout: 15_000 });
    await expect(shell.title).toHaveText("Add a credential");
  });

  // nav-03
  test("admin collapses the sidebar to a rail and expands it again, by button and by Ctrl+B", async ({
    page,
    shell,
  }) => {
    await shell.collapse.click();
    await expect(shell.expand).toBeVisible();
    await expect(shell.row("Credentials").first()).toHaveAttribute("aria-label", "Credentials");
    await shell.expand.click();
    await expect(shell.collapse).toBeVisible();
    await page.keyboard.press(process.platform === "darwin" ? "Meta+b" : "Control+b");
    await expect(shell.expand).toBeVisible();
  });

  // nav-04
  test("admin opens the bell and View all goes to the notifications page", async ({
    page,
    shell,
  }) => {
    await shell.bell.click();
    await page.getByText("View all").click();
    await page.waitForURL((url) => url.pathname.startsWith("/notifications"), {
      timeout: 15_000,
    });
    await expect(shell.title).toHaveText("Notifications");
  });

  // nav-05
  test("admin opens More options and finds Profile and Log Out", async ({ page, shell }) => {
    await shell.moreOptions.click();
    await expect(page.getByRole("menuitem", { name: /^Profile$/ })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /log ?out/i })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menuitem", { name: /log ?out/i })).toHaveCount(0);
  });

  // nav-06
  test("admin opens Invites, Management, Integrations and Advanced from the footer and closes them", async ({
    page,
    shell,
  }) => {
    await shell.row("Invites").click();
    await expect(shell.dialog("Invite Users")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(shell.dialog("Invite Users")).toHaveCount(0);
    for (const name of ["Management", "Integrations", "Advanced"]) {
      await shell.row(name).click();
      await expect(shell.dialog(name)).toBeVisible({ timeout: 30_000 });
      await page.keyboard.press("Escape");
      await expect(shell.dialog(name)).toHaveCount(0);
    }
    await shell.row("Notifications").click();
    await page.waitForURL((url) => url.pathname.startsWith("/notifications"), {
      timeout: 15_000,
    });
  });

  // nav-07
  test("admin clicks Support and the docs open in a new tab", async ({ page, shell }) => {
    await page
      .context()
      .route("https://ibl.ai/**", (route) =>
        route.fulfill({ contentType: "text/html", body: "<title>docs stub</title>" }),
      );
    const [popup] = await Promise.all([
      page.context().waitForEvent("page"),
      shell.row("Support").click(),
    ]);
    await popup.waitForLoadState("domcontentloaded");
    expect(popup.url()).toMatch(/^https:\/\/ibl\.ai\/docs/);
    await popup.close();
  });

  // nav-08
  test("admin switches to User mode and the admin rows disappear, then back", async ({ shell }) => {
    await expect(shell.row("Analytics")).toBeVisible();
    await shell.setAdminMode(false);
    await expect(shell.row("Analytics")).toHaveCount(0);
    await expect(shell.row("Management")).toHaveCount(0);
    await expect(shell.row("Issuing")).toHaveCount(0);
    await shell.setAdminMode(true);
    await expect(shell.row("Analytics")).toBeVisible();
    await expect(shell.row("Management")).toBeVisible();
    await expect(shell.row("Issuing")).toBeVisible();
  });

  // nav-09
  test("admin opens the credit balance and Upgrade asks for a checkout that comes back through sign-in", async ({
    page,
  }) => {
    // The SDK shows the balance only on a paywalled platform with a billing account: give the admin's both.
    await page.route(/\/api\/core\/users\/platforms\//, async (r) => {
      const res = await r.fetch();
      const all = (await res.json()) as object[];
      await r.fulfill({ response: res, json: all.map((p) => ({ ...p, show_paywall: true })) });
    });
    await page.route(/\/api\/billing\/account\//, (r) =>
      r.fulfill({ json: { available_credits: "10", current_plan: "free" } }),
    );
    // Off iblai.app the platform refuses a checkout that returns to the page's own origin.
    let asked: URL | undefined;
    await page.route(/\/stripe\/pricing-page-session\//, (route) => {
      asked = new URL(route.request().url());
      return route.fulfill({ status: 400, json: { redirect_url: "stubbed" } });
    });
    await gotoApp(page, "/");
    await page.getByTestId("credit-balance-trigger").click();
    await page.getByRole("button", { name: "Upgrade Plan" }).click();
    await expect
      .poll(() => asked?.searchParams.get("redirect_url"))
      .toMatch(new RegExp(`^${esc(AUTH_HOST)}/login\\?app=mentor&redirect-to=.`));
  });
});
