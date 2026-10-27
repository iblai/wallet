import { test, expect } from "../fixtures/wallet-test";
import { DEMO } from "../fixtures/test-data";
import { gotoApp, removeE2eCredentials } from "../utils/app";

/**
 * Journey 3 — Home: the empty wallet for a new account, and the dashboard
 * (tiles, what needs a decision, the latest credentials, the checklist, the
 * target role) on the sample wallet.
 */
test.describe("Journey 3: Home — Admin", () => {
  // home-01
  test("admin with an empty wallet sees the welcome and Add your first credential", async ({
    page,
    home,
    credentials,
  }) => {
    await removeE2eCredentials(page);
    test.skip((await credentials.cards().count()) > 0, "the account holds credentials");
    await gotoApp(page, "/");
    await expect(home.emptyTitle).toBeVisible();
    await home.addFirst.click();
    await page.waitForURL((url) => url.pathname === "/credentials/import", { timeout: 15_000 });
  });
});

test.describe("Journey 3: Home — Demo", { tag: "@demo" }, () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page, "/");
  });

  // home-02
  test("visitor sees the greeting, the summary line and the four tiles with their numbers", async ({
    page,
    home,
  }) => {
    await expect(home.greeting).toHaveText("Hi Jordan");
    await expect(home.summary).toHaveText("7 credentials · 6 verified · 16 skills on record");
    await expect(home.tile("Wallet health")).toContainText("80");
    await expect(home.tile("Awaiting acceptance")).toContainText("1");
    await expect(home.tile("Expiring in 90 days")).toContainText(DEMO.expiringName);
    await expect(home.tile(`${DEMO.role} fit`)).toContainText("40%");
    await home.tile("Awaiting acceptance").click();
    await page.waitForURL(
      (url) => url.pathname === "/credentials" && url.search === "?filter=pending",
    );
  });

  // home-03
  test("visitor reviews a pending credential, opens all credentials and the checklist links", async ({
    page,
    home,
  }) => {
    const decision = home.section("Needs your decision");
    await expect(decision).toContainText(DEMO.pendingName);
    await decision.getByRole("link", { name: "Review" }).first().click();
    await page.waitForURL((url) => /^\/credentials\/.+/.test(url.pathname), { timeout: 15_000 });
    await expect(page.getByText("issued this to you.")).toBeVisible();
    await gotoApp(page, "/");
    await home.section("Latest credentials").getByRole("link", { name: "All credentials" }).click();
    await page.waitForURL((url) => url.pathname === "/credentials", { timeout: 15_000 });
    await gotoApp(page, "/");
    await expect(home.section("Employer-ready checklist").getByRole("link").first()).toBeVisible();
  });

  // home-04
  test("visitor opens the full gap analysis from the target role section", async ({
    page,
    home,
  }) => {
    const toward = home.section(new RegExp(`^Toward ${DEMO.role}$`));
    await expect(toward).toBeVisible();
    await toward.getByRole("link", { name: "Full gap analysis" }).click();
    await page.waitForURL((url) => url.pathname === "/skills", { timeout: 15_000 });
  });
});
