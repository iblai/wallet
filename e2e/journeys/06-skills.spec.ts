import { test, expect } from "../fixtures/wallet-test";
import { DEMO } from "../fixtures/test-data";
import { gotoApp, pickOption, toast } from "../utils/app";

/**
 * Journey 6 — Skills: the tiles and the gap analysis on the sample wallet, a
 * role previewed from a link, goals and self-reported skills added and
 * removed, every sample skill in exactly one list (the derive fix), and a
 * target role round trip on a real account.
 */
test.describe("Journey 6: Skills — Demo", { tag: "@demo" }, () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page, "/skills");
  });

  // skl-01
  test("visitor sees the tiles, the target role and its gap analysis", async ({ page, skills }) => {
    for (const label of ["Evidenced skills", "Self-reported", "Skill points"]) {
      await expect(skills.tileValue(label)).not.toBeEmpty();
    }
    await expect(skills.targetRole).toContainText(DEMO.role);
    await expect(skills.youHave).toBeVisible();
    await expect(skills.gaps).toBeVisible();
    await expect(page.getByText("Median pay", { exact: true })).toBeVisible();
  });

  // skl-02
  test("visitor previews a role from a link and makes it the target", async ({ page, skills }) => {
    await gotoApp(page, "/skills?role=data-scientist");
    await expect(skills.previewNote).toContainText("Data Scientist");
    await skills.makeTarget.click();
    await expect(toast(page, "Target set: Data Scientist")).toBeVisible();
    await expect(skills.targetRole).toContainText("Data Scientist");
  });

  // skl-03
  test("visitor adds a goal and removes it", async ({ skills }) => {
    await skills.addSkill("goal", "Kubernetes");
    await expect(skills.list("Goals")).toContainText("Kubernetes");
    await skills.removeIn("Goals", "Kubernetes").click();
    await expect(skills.list("Goals")).not.toContainText("Kubernetes");
  });

  // skl-04
  test("visitor self-reports a skill with a level", async ({ skills }) => {
    await skills.addSkill("self", "Negotiation", 3);
    await expect(skills.list("Self-reported")).toContainText("Negotiation");
  });

  // skl-05
  test("visitor finds every sample skill in its list: a rated skill with evidence stays evidenced", async ({
    skills,
  }) => {
    await expect(skills.list("Evidenced")).toContainText("SQL");
    await expect(skills.list("Evidenced")).toContainText("Python");
    // Both self-rated in the sample and both attested by a credential (Excel through the
    // "spreadsheets" alias): the evidence decides where they live, the rating rides along.
    await expect(skills.list("Evidenced")).toContainText("Communication");
    await expect(skills.list("Evidenced")).toContainText("Excel");
    await expect(skills.list("Self-reported")).toContainText("Nothing here yet.");
    await expect(skills.list("Goals")).toContainText("Deep Learning");
  });
});

test.describe("Journey 6: Skills — Admin", () => {
  // skl-06
  test("admin sets a target role, finds it after a reload, and changes it", async ({
    page,
    skills,
  }) => {
    await gotoApp(page, "/skills");
    await skills.targetRole.click();
    await pickOption(page, "Data Scientist");
    await expect(toast(page, "Target set: Data Scientist")).toBeVisible();
    await gotoApp(page, "/skills");
    await expect(skills.targetRole).toContainText("Data Scientist");
    await skills.targetRole.click();
    await pickOption(page, "Data Analyst");
    await expect(toast(page, "Target set: Data Analyst")).toBeVisible();
  });
});
