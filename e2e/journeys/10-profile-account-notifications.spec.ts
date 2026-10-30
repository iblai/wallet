import { test, expect } from "../fixtures/wallet-test";
import { gotoApp, panelControl, section, toast } from "../utils/app";

/**
 * Journey 10 — Profile, account & notifications: the SDK profile, the account
 * panel, the notifications inbox, and the demo's own profile forms.
 */
test.describe("Journey 10: Profile, Account & Notifications — Admin", () => {
  // prof-01
  test("admin opens the profile: the SDK profile, without the starter's example preferences", async ({
    page,
  }) => {
    await gotoApp(page, "/profile");
    await expect(
      page
        .getByRole("tab", { name: "Education" })
        .or(page.getByRole("button", { name: "Education" }))
        .first(),
    ).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText("App preferences")).toHaveCount(0);
  });

  // prof-02
  test("admin opens the account page and the SDK panel loads", async ({ page, shell }) => {
    await gotoApp(page, "/account");
    await expect(shell.title).toHaveText("Account");
    await expect(page.getByText("Loading account settings...")).toHaveCount(0, { timeout: 60_000 });
    await expect(panelControl(page)).toBeVisible();
  });

  // prof-03
  test("admin opens notifications and sees the inbox or its empty state", async ({
    page,
    shell,
  }) => {
    await gotoApp(page, "/notifications");
    await expect(shell.title).toHaveText("Notifications");
    await expect(page.getByText("Loading notifications...")).toHaveCount(0, { timeout: 60_000 });
    await expect(page.getByText(/^(Inbox|No notifications found)$/).first()).toBeVisible();
  });
});

test.describe("Journey 10: Profile — Demo", { tag: "@demo" }, () => {
  // prof-04
  test("visitor edits the sample profile: saves the basics, adds a school and removes it", async ({
    page,
  }) => {
    await gotoApp(page, "/profile");
    await section(page, "Basic").getByRole("button", { name: "Save" }).click();
    await expect(toast(page, "Profile saved")).toBeVisible();
    const education = section(page, /^Education/);
    await education.getByRole("button", { name: "Add" }).click();
    const dialog = page.getByRole("dialog", { name: "Education" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("textbox").first().fill("E2E University");
    await dialog.getByRole("button", { name: "Save" }).click();
    await expect(education).toContainText("E2E University");
    await education.getByRole("button", { name: "Remove" }).last().click();
    await expect(toast(page, "Removed")).toBeVisible();
    await expect(education).not.toContainText("E2E University");
  });
});
