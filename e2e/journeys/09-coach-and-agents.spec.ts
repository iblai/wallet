import { test, expect, pages } from "../fixtures/wallet-test";
import { gotoApp } from "../utils/app";

/**
 * Journey 9 — Coach & agents: the chat or its honest empty states for an
 * admin, a member and the demo, and the SDK agents browser.
 */
test.describe("Journey 9: Coach & Agents — Admin", () => {
  // coach-01
  test("admin opens the Coach: the chat, or the empty state that leads to setup", async ({
    page,
    coach,
  }) => {
    await gotoApp(page, "/coach");
    await expect(coach.composer.or(coach.noAgent).first()).toBeVisible({ timeout: 60_000 });
    if (await coach.noAgent.isVisible()) {
      await coach.chooseAgent.click();
      await page.waitForURL((url) => url.pathname === "/setup", { timeout: 15_000 });
    }
  });

  // coach-03
  test("admin browses the agents and opens one on the Coach, ready to chat", async ({
    page,
    coach,
  }) => {
    await gotoApp(page, "/agents");
    await expect(coach.agentsHeading).toBeVisible({ timeout: 60_000 });
    await expect(coach.agentsSearch).toBeVisible();
    await expect(coach.createCustom).toBeVisible();
    const cards = coach.agentCards();
    await cards
      .first()
      .waitFor({ state: "visible", timeout: 30_000 })
      .catch(() => {});
    test.skip((await cards.count()) === 0, "the organization has no agent yet");
    const crashes: string[] = [];
    page.on("pageerror", (e) => crashes.push(e.message));
    await cards.first().click();
    await page.waitForURL((url) => url.pathname === "/coach" && url.searchParams.has("agent"), {
      timeout: 15_000,
    });
    // Ready means the store mounts every SDK API and the agent's permissions are in.
    await expect(coach.composer).toBeEditable({ timeout: 60_000 });
    expect(crashes).toEqual([]);
  });
});

test.describe("Journey 9: Coach & Agents — Non-Admin", () => {
  // coach-02
  test("member opens the Coach: the chat, or the hint to ask an admin, never a Choose button", async ({
    memberPage,
  }) => {
    const { coach } = pages(memberPage);
    await gotoApp(memberPage, "/coach");
    await expect(coach.composer.or(coach.noAgent).first()).toBeVisible({ timeout: 60_000 });
    if (await coach.noAgent.isVisible()) await expect(coach.memberHint).toBeVisible();
    await expect(coach.chooseAgent).toHaveCount(0);
  });
});

test.describe("Journey 9: Coach & Agents — Demo", { tag: "@demo" }, () => {
  // coach-04
  test("visitor opens the Coach and learns it needs a platform", async ({ page, coach }) => {
    await gotoApp(page, "/coach");
    await expect(coach.needsPlatform).toBeVisible();
  });
});
