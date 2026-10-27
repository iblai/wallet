import { test, expect, pages } from "../fixtures/wallet-test";
import { APP_HOST, stamp } from "../fixtures/test-data";
import { content, gotoApp, gotoBare, panelControl, toast } from "../utils/app";

/**
 * Journey 11 — Admin: the analytics routes behind the SDK tab strip, Users
 * with the invite actions, the organization settings round trip, the
 * organization's credentials, Billing and Memory, the Coach's setup, and the
 * gates a member meets.
 */
const ANALYTICS: [string, string][] = [
  ["Overview", "/admin/analytics"],
  ["Users", "/admin/analytics/users"],
  ["Topics", "/admin/analytics/topics"],
  ["Transcripts", "/admin/analytics/transcripts"],
  ["Financial", "/admin/analytics/financial"],
  ["Reports", "/admin/analytics/reports"],
];

test.describe("Journey 11: Admin — Admin", () => {
  // adm-01
  test("admin walks the analytics rows and the strip offers only routed tabs", async ({
    page,
    shell,
  }) => {
    test.setTimeout(240_000);
    await gotoApp(page, "/");
    await shell.row("Analytics").click();
    for (const [label, path] of ANALYTICS) {
      await shell.item(label).click();
      await page.waitForURL((url) => url.pathname === path, { timeout: 15_000 });
      await expect(shell.title).toHaveText("Analytics");
      await expect(page.getByRole("heading", { name: "404" })).toHaveCount(0);
    }
    await expect(content(page).getByText("Overview", { exact: true }).first()).toBeVisible({
      timeout: 60_000,
    });
    for (const tab of ["Courses", "Programs", "Memory", "Audit"]) {
      await expect(content(page).getByText(tab, { exact: true })).toHaveCount(0);
    }
  });

  // adm-02
  test("admin opens Users: the invite actions and the SDK Management panel", async ({
    page,
    admin,
  }) => {
    await gotoApp(page, "/admin/users");
    await expect(admin.pendingInvites).toBeVisible();
    await admin.inviteUser.click();
    await expect(admin.inviteDialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(admin.inviteDialog).toHaveCount(0);
    await expect(admin.tab("Users")).toBeVisible({ timeout: 60_000 });
    await expect(admin.tab("Roles")).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Email" })).toBeVisible();
  });

  // adm-03
  test("admin changes the welcome message, finds it after a reload, and restores it", async ({
    page,
    admin,
  }) => {
    await gotoApp(page, "/admin/organization");
    await expect(admin.welcome).toBeEnabled({ timeout: 60_000 });
    const previous = await admin.welcome.inputValue();
    const text = `E2E ${stamp()}`;
    await admin.welcome.fill(text);
    await admin.saveSettings.click();
    await expect(toast(page, "Organization settings saved")).toBeVisible();
    await gotoApp(page, "/admin/organization");
    await expect(admin.welcome).toHaveValue(text, { timeout: 60_000 });
    await admin.welcome.fill(previous);
    await admin.saveSettings.click();
    await expect(toast(page, "Organization settings saved")).toBeVisible();
  });

  // adm-04
  test("admin opens the organization's credentials: the issued and issuable lists or their empty states", async ({
    page,
    admin,
  }) => {
    await gotoApp(page, "/admin/credentials");
    await expect(admin.issuedHeading).toBeVisible({ timeout: 60_000 });
    await expect(admin.canIssueHeading).toBeVisible();
    await expect(
      admin.nothingIssued.or(page.getByRole("columnheader", { name: "Recipient" })).first(),
    ).toBeVisible();
    await expect(
      admin.noDefinitions.or(page.getByRole("columnheader", { name: "Attached to" })).first(),
    ).toBeVisible();
  });

  // adm-05
  test("admin opens Billing and Memory and the SDK panels render", async ({ page, shell }) => {
    for (const [path, title] of [
      ["/admin/billing", "Billing"],
      ["/admin/memory", "Memory"],
    ] as const) {
      await gotoApp(page, path);
      await expect(shell.title).toHaveText(title);
      await expect(panelControl(page)).toBeVisible({ timeout: 60_000 });
    }
  });

  // adm-06
  test("admin opens setup: the agent picker, the create modal, and Cancel back to the Coach", async ({
    page,
    admin,
  }) => {
    await gotoBare(page, "/setup");
    await expect(admin.setupHeading).toBeVisible({ timeout: 60_000 });
    await expect(admin.searchAgents).toBeVisible();
    await admin.createAgent.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await admin.cancelSetup.click();
    await page.waitForURL((url) => url.pathname === "/coach", { timeout: 15_000 });
  });

  // adm-07
  test("admin picks an agent on setup, the Coach opens it, and the platform default is restored", async ({
    page,
    admin,
    coach,
  }) => {
    test.setTimeout(180_000);
    await gotoBare(page, "/setup");
    await expect(admin.setupHeading).toBeVisible({ timeout: 60_000 });
    const tile = admin.agentTiles().first();
    await tile.waitFor({ state: "visible", timeout: 30_000 }).catch(() => {});
    test.skip((await tile.count()) === 0, "the organization has no agent yet");
    await tile.click();
    await admin.saveSetup.click();
    await page.waitForURL((url) => url.pathname === "/coach", { timeout: 60_000 });
    await expect(coach.composer).toBeVisible({ timeout: 60_000 });
    // Leave the organization as it was: no agent pinned for the Coach.
    await gotoBare(page, "/setup");
    await expect(admin.useDefaultAgent).toBeVisible({ timeout: 60_000 });
    await admin.useDefaultAgent.click();
    await page.waitForURL((url) => url.pathname === "/coach", { timeout: 60_000 });
  });
});

test.describe("Journey 11: Admin — Non-Admin", () => {
  // adm-08
  test("member is told setup is for admins and the admin pages send them home", async ({
    memberPage,
  }) => {
    const { admin } = pages(memberPage);
    await gotoBare(memberPage, "/setup");
    await expect(admin.adminOnly).toBeVisible({ timeout: 60_000 });
    for (const path of ["/admin/users", "/admin/organization"]) {
      await memberPage.goto(`${APP_HOST}${path}`);
      await memberPage.waitForURL((url) => url.pathname === "/", { timeout: 30_000 });
    }
  });
});
