import fs from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import { test, expect } from "../fixtures/wallet-test";
import { DEMO } from "../fixtures/test-data";
import { gotoApp } from "../utils/app";

/**
 * Journey 14 — The sample wallet on the community organization: a member whose
 * only organization is `main` sees Jordan Rivera's sample wallet under the
 * amber notice, read-only — a change opens the upgrade dialog and saves
 * nothing — and the résumé offers no AI draft. The member's session is told it
 * belongs to `main` alone, in storage and by the routed membership list.
 * Nothing reaches the checkout: smp-05 answers it locally.
 */
const MAIN = process.env.NEXT_PUBLIC_MAIN_TENANT_KEY || "main";
/** The installed web-containers declares the upgrade dialog's `checkoutUrl` (iblai-web-frontend#2195). */
const sdkHasCheckoutUrl = fs
  .readFileSync(
    path.resolve(__dirname, "../../node_modules/@iblai/web-containers/dist/index.d.ts"),
    "utf8",
  )
  .includes("checkoutUrl");

/** The member's session, told it belongs to the community organization only. */
async function onMain(page: Page) {
  const entry = { key: MAIN, org: MAIN, platform_name: "ibl.ai", is_admin: false };
  await page
    .context()
    .route(/\/api\/ibl\/users\/manage\/platform\//, (r) => r.fulfill({ json: [entry] }));
  // The list newer web-utils reads: the member's real memberships, `main` alone kept.
  await page.context().route(/\/api\/core\/users\/platforms\//, async (r) => {
    const res = await r.fetch();
    const all = (await res.json()) as { key: string }[];
    await r.fulfill({ response: res, json: all.filter((p) => p.key === MAIN) });
  });
  await page.context().addInitScript((only: typeof entry) => {
    localStorage.setItem("tenants", JSON.stringify([only]));
    localStorage.setItem("tenant", only.key);
    localStorage.setItem("current_tenant", JSON.stringify(only));
    localStorage.removeItem("app_tenant");
  }, entry);
}

test.describe("Journey 14: Sample wallet — Member on the community organization", () => {
  // smp-01
  test("member on main sees Jordan Rivera's sample wallet under the amber notice", async ({
    memberPage,
  }) => {
    await onMain(memberPage);
    await gotoApp(memberPage, "/");
    const notice = memberPage.getByTestId("sample-notice");
    await expect(notice).toContainText("sample wallet");
    await expect(notice.getByRole("button", { name: "Create your organization" })).toBeVisible();
  });

  // smp-02
  test("member on main finds the sample's credentials and opens one", async ({ memberPage }) => {
    await onMain(memberPage);
    await gotoApp(memberPage, "/credentials");
    await expect(memberPage.getByRole("heading", { level: 3, name: DEMO.publicName })).toBeVisible({
      timeout: 30_000,
    });
    await memberPage.getByRole("heading", { level: 3, name: DEMO.publicName }).first().click();
    await expect(memberPage.getByRole("heading", { name: DEMO.publicName }).first()).toBeVisible();
  });

  // smp-03
  test("member on main declines a pending sample credential: the upgrade dialog opens and nothing is saved", async ({
    memberPage,
  }) => {
    const writes: string[] = [];
    memberPage.on("request", (req) => {
      if (/platform-metadata/.test(req.url()) && req.method() !== "GET") writes.push(req.url());
    });
    await onMain(memberPage);
    await gotoApp(memberPage, "/credentials?filter=pending");
    await memberPage.getByRole("heading", { level: 3, name: DEMO.pendingName }).first().click();
    await memberPage.getByRole("button", { name: "Decline", exact: true }).click();
    await expect(
      memberPage.getByRole("dialog").filter({ hasText: "Upgrade for free" }),
    ).toBeVisible({
      timeout: 15_000,
    });
    expect(writes).toEqual([]);
  });

  // smp-04
  test("member on main gets no AI draft on the sample résumé", async ({ memberPage }) => {
    await onMain(memberPage);
    await gotoApp(memberPage, "/resume");
    await expect(memberPage.getByRole("textbox", { name: "Summary" })).toBeVisible();
    await expect(memberPage.getByRole("button", { name: /Draft for me/ })).toHaveCount(0);
  });

  // smp-05
  test("member on main: the upgrade dialog's Upgrade for free opens the wallet's $0 checkout", async ({
    memberPage,
  }) => {
    test.skip(
      !sdkHasCheckoutUrl,
      "web-containers lacks checkoutUrl: the release of iblai-web-frontend#2195",
    );
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://wallet.iblai.me").replace(
      /\/+$/,
      "",
    );
    let checkout = "";
    await memberPage.route(/credits-free-plan/, (route) => {
      checkout = route.request().url();
      return route.fulfill({ contentType: "text/html", body: "<title>checkout stub</title>" });
    });
    await onMain(memberPage);
    await gotoApp(memberPage, "/");
    await memberPage
      .getByTestId("sample-notice")
      .getByRole("button", { name: "Create your organization" })
      .click();
    await memberPage.getByRole("dialog").getByRole("button", { name: "Upgrade for free" }).click();
    await expect
      .poll(() => checkout)
      .toContain("/api/service/stripe/checkout/redirect/credits-free-plan/");
    const back = new URL(new URL(checkout).searchParams.get("redirect_url") ?? "");
    expect(back.searchParams.get("app")).toBe("mentor");
    expect(back.searchParams.get("redirect-to")).toBe(appUrl);
  });
});
