import { test, expect } from "../fixtures/wallet-test";
import { DEMO } from "../fixtures/test-data";
import { gotoApp, pickOption, toast } from "../utils/app";

/**
 * Journey 5 — Credential states on the sample wallet: the filters, sort and
 * search, a pending credential declined, an expired self-reported record, an
 * expiring certification, collections, the sample reset and an unknown id.
 */
test.describe("Journey 5: Credential states — Demo", { tag: "@demo" }, () => {
  // cst-01
  test("visitor sees every filter's count and ?filter=pending preselects the pending one", async ({
    page,
    credentials,
  }) => {
    await gotoApp(page, "/credentials");
    for (const [label, n] of [
      ["All", 7],
      ["Verified", 5],
      ["Awaiting acceptance", 1],
      ["Expiring", 1],
      ["Expired / revoked", 1],
      ["Public", 4],
      ["Self-reported", 1],
    ] as const) {
      await expect(credentials.filter(label)).toHaveText(new RegExp(`^${label}\\s*${n}$`));
    }
    await gotoApp(page, "/credentials?filter=pending");
    await expect(credentials.cards()).toHaveCount(1);
    await expect(credentials.card(DEMO.pendingName)).toBeVisible();
  });

  // cst-02
  test("visitor sorts by name, searches, and narrows to a collection", async ({
    page,
    credentials,
  }) => {
    await gotoApp(page, "/credentials");
    await credentials.sort.click();
    await pickOption(page, "By name");
    await expect(credentials.cards().first()).toContainText(DEMO.expiringName);
    await credentials.search.fill("AWS");
    await expect(credentials.cards()).toHaveCount(1);
    await credentials.search.fill("");
    await credentials.collection.click();
    await pickOption(page, DEMO.collection);
    await expect(credentials.cards()).toHaveCount(3);
  });

  // cst-03
  test("visitor declines the pending credential", async ({ page, credentials }) => {
    await credentials.openCard(DEMO.pendingName);
    await expect(credentials.pendingBanner).toBeVisible();
    await credentials.decline.click();
    await expect(toast(page, "Declined")).toBeVisible();
    await expect(credentials.badge("Declined")).toBeVisible();
  });

  // cst-04
  test("visitor opens the expired self-reported record, which cannot be shared", async ({
    page,
    credentials,
  }) => {
    await credentials.openCard(DEMO.expiredName);
    await expect(credentials.badge("Expired")).toBeVisible();
    await expect(credentials.badge("Self-reported")).toBeVisible();
    await expect(page.getByText("Only active, accepted credentials can be shared.")).toBeVisible();
  });

  // cst-05
  test("visitor opens the expiring certification and sees the renewal banner", async ({
    page,
    credentials,
  }) => {
    await credentials.openCard(DEMO.expiringName);
    await expect(page.getByText(/^Expires in \d+ days\.$/)).toBeVisible();
  });

  // cst-06
  test("visitor opens Collections, sees the existing one and creates another", async ({
    page,
    credentials,
  }) => {
    await credentials.openCard(DEMO.publicName);
    await credentials.collectionsButton.click();
    await expect(credentials.collectionsDialog).toBeVisible();
    await expect(
      credentials.collectionsDialog.getByRole("checkbox", { name: DEMO.collection }),
    ).toBeVisible();
    await credentials.collectionsDialog
      .getByRole("textbox", { name: "New collection name" })
      .fill("Grants");
    await credentials.collectionsDialog.getByRole("button", { name: "Create" }).click();
    await expect(toast(page, "Added to Grants")).toBeVisible();
  });

  // cst-07
  test("visitor declines a credential and Reset sample data brings it back", async ({
    page,
    credentials,
    shell,
  }) => {
    await credentials.openCard(DEMO.pendingName);
    await credentials.decline.click();
    await expect(toast(page, "Declined")).toBeVisible();
    await gotoApp(page, "/credentials");
    await expect(credentials.filter("Awaiting acceptance")).toHaveText(/0$/);
    await shell.resetDemo.click();
    await expect(credentials.filter("Awaiting acceptance")).toHaveText(/1$/);
  });

  // cst-08
  test("visitor opens an unknown credential id and is offered the way back", async ({
    page,
    credentials,
  }) => {
    await gotoApp(page, "/credentials/nope");
    await expect(credentials.notFound).toBeVisible();
    await page.getByRole("link", { name: "Back to credentials" }).click();
    await page.waitForURL((url) => url.pathname === "/credentials", { timeout: 15_000 });
  });
});
