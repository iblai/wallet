import { test, expect, pages } from "../fixtures/wallet-test";
import { E2E_RECORD, SAMPLE_ISSUER_HOST, SAMPLE_OB2_NAME, stamp } from "../fixtures/test-data";
import { download, gotoApp, removeE2eCredentials, serveSampleIssuer, toast } from "../utils/app";

/**
 * Journey 4 — Credentials lifecycle on a real account: import the sample badge,
 * accept it, find it, share it, export it, change its visibility, add a record
 * by hand, and remove everything again. Serial: each step builds on the last;
 * the first and the last leave the wallet empty.
 */
test.describe("Journey 4: Credentials lifecycle — Admin", () => {
  test.describe.configure({ mode: "serial" });

  // cred-01
  test("admin goes to Credentials with an empty wallet and follows Add credential", async ({
    page,
    credentials,
  }) => {
    await removeE2eCredentials(page);
    test.skip((await credentials.cards().count()) > 0, "the account holds credentials");
    await expect(credentials.emptyTitle).toHaveText("No credentials yet");
    await credentials.addLink.click();
    await page.waitForURL((url) => url.pathname === "/credentials/import", { timeout: 15_000 });
  });

  // cred-02
  test("admin pastes bad JSON, then the sample badge, and adds it to the wallet", async ({
    page,
    credentials,
  }) => {
    await credentials.openImport();
    await credentials.tab("Paste JSON").click();
    await credentials.jsonBox.fill("not json");
    await expect(
      page.getByText("That is not valid JSON. Paste the badge's JSON (Open Badges 2.0 or 3.0)."),
    ).toBeVisible();
    await credentials.sample("2.0").click();
    await expect(credentials.recognized).toBeVisible();
    await credentials.addToWallet.click();
    await expect(toast(page, `${SAMPLE_OB2_NAME} added`)).toBeVisible();
    await page.waitForURL((url) => /^\/credentials\/.+/.test(url.pathname), { timeout: 15_000 });
    await expect(credentials.title).toHaveText(SAMPLE_OB2_NAME);
  });

  // cred-03
  test("admin accepts the pending badge and it becomes active and public", async ({
    credentials,
  }) => {
    await credentials.openCard(SAMPLE_OB2_NAME);
    await expect(credentials.pendingBanner).toBeVisible();
    await expect(credentials.badge("Awaiting acceptance")).toBeVisible();
    await credentials.acceptCurrent();
    await expect(credentials.visibility()).toHaveText("Public");
  });

  // cred-04
  test("admin finds the badge in the list by filter and search", async ({ page, credentials }) => {
    await gotoApp(page, "/credentials");
    await expect(credentials.filter("All")).toHaveText(/^All\s*1$/);
    await expect(credentials.card(SAMPLE_OB2_NAME)).toBeVisible();
    await credentials.search.fill("SQL");
    await expect(credentials.card(SAMPLE_OB2_NAME)).toBeVisible();
    await credentials.search.fill("zzz");
    await expect(credentials.emptyTitle).toHaveText("Nothing matches");
  });

  // cred-05
  test("admin opens Share and the verify link carries the holder's copy", async ({
    page,
    credentials,
  }) => {
    await credentials.openCard(SAMPLE_OB2_NAME);
    await credentials.shareButton.click();
    await expect(credentials.shareDialog).toBeVisible();
    await expect(credentials.shareDialog.locator("input[readonly]").first()).toHaveValue(
      /\/verify\/.+\?org=.+&u=.+#c=/,
    );
    await credentials.shareDialog.getByRole("button", { name: "Copy link" }).click();
    await expect(toast(page, /Link copied|Clipboard unavailable/)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(credentials.shareDialog).toHaveCount(0);
  });

  // cred-06
  test("admin exports the badge as Open Badges 3.0 JSON", async ({ page, credentials }) => {
    await credentials.openCard(SAMPLE_OB2_NAME);
    const file = await download(page, credentials.exportOb3);
    expect(file.name).toBe("sql-for-analysts.ob3.json");
    expect(JSON.parse(file.text).type).toContain("OpenBadgeCredential");
  });

  // cred-07
  test("admin makes the badge private and public again", async ({ page, credentials }) => {
    await credentials.openCard(SAMPLE_OB2_NAME);
    await credentials.makePrivate.click();
    await expect(toast(page, "Now private")).toBeVisible();
    await expect(credentials.visibility()).toHaveText("Private");
    await credentials.makePublic.click();
    await expect(toast(page, "Now public")).toBeVisible();
    await expect(credentials.visibility()).toHaveText("Public");
  });

  // cred-08
  test("admin pastes a badge link: an http link is refused, an https one is fetched", async ({
    page,
    credentials,
  }) => {
    await gotoApp(page, "/credentials/import");
    await credentials.tab("Badge link").click();
    await credentials.badgeUrl.fill("http://badges.example.org/assertions/x");
    await credentials.fetchBadge.click();
    await expect(page.getByText("Paste an https:// badge link.")).toBeVisible();
    await serveSampleIssuer(page);
    await credentials.badgeUrl.fill(`${SAMPLE_ISSUER_HOST}/assertions/5a1f-sql-for-analysts`);
    await credentials.fetchBadge.click();
    await expect(credentials.recognized).toBeVisible();
  });

  // cred-09
  test("admin adds a record by hand, sees it self-reported, and removes it", async ({
    page,
    credentials,
  }) => {
    const name = `${E2E_RECORD} ${stamp()}`;
    await credentials.openImport();
    await credentials.tab("Add manually").click();
    await expect(credentials.addToWallet).toBeDisabled();
    await credentials.field("Texas Notary Public Commission").fill(name);
    await credentials.field("Texas Secretary of State").fill("E2E Issuer");
    await credentials.addToWallet.click();
    await expect(toast(page, `${name} added`)).toBeVisible();
    await page.waitForURL((url) => /^\/credentials\/.+/.test(url.pathname), { timeout: 15_000 });
    await expect(credentials.title).toHaveText(name);
    await expect(credentials.badge("Self-reported")).toBeVisible();
    await credentials.removeCurrent();
  });

  // cred-10
  test("admin removes the badge and the wallet is empty again", async ({ credentials }) => {
    await credentials.openCard(SAMPLE_OB2_NAME);
    await credentials.removeCurrent();
    await expect(credentials.emptyTitle).toHaveText("No credentials yet");
  });
});

test.describe("Journey 4: Credentials lifecycle — Non-Admin", () => {
  // cred-11
  test("member imports the 3.0 sample, accepts it and removes it", async ({ memberPage }) => {
    const m = pages(memberPage);
    await removeE2eCredentials(memberPage);
    await m.credentials.importSample("3.0");
    await m.credentials.acceptCurrent();
    await m.credentials.removeCurrent();
    await expect(m.credentials.emptyTitle).toHaveText("No credentials yet");
  });
});
