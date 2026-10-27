import { devices } from "@playwright/test";
import { test, expect } from "../fixtures/wallet-test";
import { DEMO } from "../fixtures/test-data";
import { expectNoSidewaysOverflow, gotoApp, gotoBare, openSheet } from "../utils/app";

/**
 * Journey 12 — Mobile: every page on a Pixel 7 without sideways overflow, the
 * sidebar sheet, and the public pages an employer opens on a phone.
 */
const PAGES: [string, string][] = [
  ["/", "Wallet"],
  ["/credentials", "Credentials"],
  ["/credentials/import", "Add a credential"],
  ["/skills", "Skills"],
  ["/resume", "Résumé"],
  ["/share", "Share"],
  ["/coach", "Coach"],
  ["/agents", "Agents"],
  ["/profile", "Profile"],
  ["/notifications", "Notifications"],
  ["/admin/users", "Users"],
  ["/admin/analytics", "Analytics"],
  ["/admin/organization", "Organization"],
  ["/admin/credentials", "Credentials"],
];

test.describe("Journey 12: Mobile — Admin", () => {
  // mob-01
  test("admin on a phone opens every page without sideways overflow", async ({ page, shell }) => {
    test.setTimeout(300_000);
    for (const [path, title] of PAGES) {
      await gotoApp(page, path);
      await expect(shell.title).toHaveText(title);
      await expectNoSidewaysOverflow(page);
    }
  });

  // mob-02
  test("admin on a phone opens the sidebar sheet and reaches Credentials and Skills", async ({
    page,
    shell,
  }) => {
    await gotoApp(page, "/");
    for (const [label, path] of [
      ["Credentials", "/credentials"],
      ["Skills", "/skills"],
    ] as const) {
      const sheet = await openSheet(page);
      await sheet.getByRole("button", { name: label, exact: true }).first().click();
      await page.waitForURL((url) => url.pathname === path, { timeout: 15_000 });
      await expect(shell.sheet).toBeHidden();
      await expect(shell.title).toHaveText(label);
    }
  });

  // mob-04
  // fixme: the SDK navbar hides the mode switcher below xl (hidden xl:flex), so a phone has no User/Admin switch.
  test.fixme("admin on a phone can leave Admin mode", async () => {});
});

test.describe("Journey 12: Mobile — Demo", { tag: "@demo" }, () => {
  // The device's context options only: its browser type would force a new worker.
  const pixel7 = devices["Pixel 7"];
  test.use({
    viewport: pixel7.viewport,
    deviceScaleFactor: pixel7.deviceScaleFactor,
    isMobile: pixel7.isMobile,
    hasTouch: pixel7.hasTouch,
    userAgent: pixel7.userAgent,
  });

  // mob-03
  test("employer on a phone opens the public wallet and a verify page without sideways overflow", async ({
    page,
    pub,
  }) => {
    await gotoBare(page, `/p/${DEMO.org}/${DEMO.username}`);
    await expect(pub.name).toHaveText(DEMO.name);
    await expectNoSidewaysOverflow(page);
    await gotoBare(page, `/verify/${DEMO.verifiedId}`);
    await expect(pub.verdict).toHaveText("Verified");
    await expectNoSidewaysOverflow(page);
  });
});
