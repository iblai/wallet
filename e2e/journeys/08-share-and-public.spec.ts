import { test, expect, pages } from "../fixtures/wallet-test";
import { SAMPLE_ISSUER_HOST, SAMPLE_OB2_NAME, stamp } from "../fixtures/test-data";
import {
  download,
  gotoApp,
  gotoBare,
  removeE2eCredentials,
  serveSampleIssuer,
  toast,
  username,
} from "../utils/app";

/**
 * Journey 8 — Share & the public page: a real account publishes its wallet
 * and an employer opens the link cold, verifies the badge against the issuer
 * (served by a stub route), and sees the honest verdicts when the issuer is
 * unreachable or the id unknown. Serial; the wallet is left empty and private.
 */
test.describe("Journey 8: Share & public page — Admin", () => {
  test.describe.configure({ mode: "serial" });
  let publicUrl = "";
  let verifyUrl = "";

  // shr-01
  test("admin imports and accepts the sample badge, turns the public page on and gets a link", async ({
    page,
    credentials,
    share,
  }) => {
    await removeE2eCredentials(page);
    await credentials.importSample("2.0");
    await credentials.acceptCurrent();
    await credentials.shareButton.click();
    verifyUrl = await credentials.shareDialog.locator("input[readonly]").first().inputValue();
    await page.keyboard.press("Escape");
    await gotoApp(page, "/share");
    await share.setPublic(false);
    await share.setPublic(true);
    publicUrl = await share.link.inputValue();
    expect(publicUrl).toMatch(/\/p\/[^/]+\/[^/#]+#d=/);
  });

  // shr-02
  test("admin saves a display handle, sees an invalid one refused, and restores the old one", async ({
    page,
    share,
  }) => {
    await gotoApp(page, "/share");
    const previous = await share.handle.inputValue();
    await share.handle.fill(`e2e-${stamp()}`);
    await share.saveHandle.click();
    await expect(toast(page, "Handle saved")).toBeVisible();
    await share.handle.fill("-bad");
    await expect(share.handleError).toBeVisible();
    await expect(share.saveHandle).toBeDisabled();
    await share.handle.fill(previous);
    await share.saveHandle.click();
    await expect(toast(page, "Handle saved")).toBeVisible();
  });

  // shr-03
  test("admin copies the public link and the LinkedIn post points at it", async ({
    page,
    share,
  }) => {
    await gotoApp(page, "/share");
    await share.copyLink.click();
    await expect(toast(page, /Link copied|Clipboard unavailable/)).toBeVisible();
    await expect(share.openPublic).toBeVisible();
    await expect(share.postLinkedIn).toHaveAttribute("href", /linkedin\.com\/sharing/);
  });

  // shr-04
  test("employer opens the public link cold and sees the wallet", async ({ publicPage }) => {
    const { pub } = pages(publicPage);
    await gotoBare(publicPage, publicUrl);
    await expect(pub.name).not.toBeEmpty();
    await expect(pub.verifiable).toHaveText("1 of 1 credentials independently verifiable");
    await expect(pub.credentialsHeading()).toHaveText("Credentials (1)");
    await expect(pub.credentialLink(SAMPLE_OB2_NAME)).toHaveAttribute(
      "href",
      /\/verify\/.+\?org=.+&u=.+/,
    );
  });

  // shr-05
  test("employer verifies the badge: live against the issuer, then unreachable, then an unknown id", async ({
    publicPage,
  }) => {
    const { pub } = pages(publicPage);
    await serveSampleIssuer(publicPage);
    await gotoBare(publicPage, verifyUrl);
    await expect(pub.verdict).toHaveText("Verified");
    await expect(pub.credentialTitle).toHaveText(SAMPLE_OB2_NAME);
    await expect(pub.issuerRecord).toBeVisible();
    await expect(pub.holder).toBeVisible();
    await publicPage.unroute(`${SAMPLE_ISSUER_HOST}/**`);
    await publicPage.route(`${SAMPLE_ISSUER_HOST}/**`, (route) => route.abort());
    // The same URL again would not reload the document; a reload re-runs the check.
    await publicPage.reload();
    await expect(pub.verdict).toHaveText("Could not reach the issuer");
    // A badge link nobody can read, with no holder copy in the link: nothing to verify.
    // (An unknown platform id is "Nothing to verify" too, until the public endpoint throttles
    // repeated unknown lookups with 429, which the page reports as unreachable — so the
    // stable probe is a badge link.)
    await gotoBare(
      publicPage,
      `/verify/${encodeURIComponent(`${SAMPLE_ISSUER_HOST}/nothing`)}?org=x&u=y`,
    );
    await expect(pub.verdict).toHaveText("Nothing to verify");
    await expect(pub.noCredential).toBeVisible();
  });

  // shr-06
  test("admin moves the badge between the public and private lists", async ({ page, share }) => {
    await gotoApp(page, "/share");
    await expect(share.publicList()).toContainText(SAMPLE_OB2_NAME);
    await share.publicList().getByRole("button", { name: "Make private" }).click();
    await expect(toast(page, "Now private")).toBeVisible();
    await expect(share.privateList()).toContainText(SAMPLE_OB2_NAME);
    await share.privateList().getByRole("button", { name: "Make public" }).click();
    await expect(toast(page, "Now public")).toBeVisible();
    await expect(share.publicList()).toContainText(SAMPLE_OB2_NAME);
  });

  // shr-07
  test("admin exports the record as an OB3 bundle", async ({ page, share }) => {
    await gotoApp(page, "/share");
    const user = await username(page);
    const file = await download(page, share.exportBundle);
    expect(file.name).toBe(`${user}-wallet.json`);
    expect(JSON.parse(file.text).verifiableCredential).toHaveLength(1);
  });

  // shr-08
  test("admin turns the public page off and removes the badge", async ({
    page,
    share,
    credentials,
  }) => {
    await gotoApp(page, "/share");
    await share.setPublic(false);
    // Off hides the link: one already sent keeps working (it carries its own copy), so none is offered.
    await expect(share.link).toHaveCount(0);
    await removeE2eCredentials(page);
    await expect(credentials.emptyTitle).toHaveText("No credentials yet");
  });
});
