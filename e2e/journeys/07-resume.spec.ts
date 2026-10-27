import { test, expect } from "../fixtures/wallet-test";
import { DEMO, stamp } from "../fixtures/test-data";
import { download, esc, gotoApp, pickOption, printed, stubPrint, toast } from "../utils/app";

/**
 * Journey 7 — Résumé: the document and its layout choices on the sample
 * wallet (template, sections, featured credentials, the three exports), and
 * on a real account the summary round trip and the AI draft.
 */
test.describe("Journey 7: Résumé — Demo", { tag: "@demo" }, () => {
  // res-01
  test("visitor sees the document with the name and the five sections", async ({
    page,
    resume,
  }) => {
    await gotoApp(page, "/resume");
    await expect(resume.article.getByRole("heading", { level: 1 })).toHaveText(DEMO.name);
    for (const title of [
      "Summary",
      "Skills",
      "Experience",
      "Licenses & Certifications",
      "Education",
    ]) {
      await expect(resume.articleHeading(title)).toBeVisible();
    }
  });

  // res-02
  test("visitor switches the template and hides the education section, then shows it again", async ({
    page,
    resume,
  }) => {
    await gotoApp(page, "/resume");
    await resume.template.click();
    await pickOption(page, "Compact — one page");
    await expect(toast(page, "Saved")).toBeVisible();
    await expect(resume.template).toContainText("Compact");
    await resume.sectionSwitch("education").click();
    await expect(resume.articleHeading("Education")).toHaveCount(0);
    await resume.sectionSwitch("education").click();
    await expect(resume.articleHeading("Education")).toBeVisible();
  });

  // res-03
  test("visitor unticks a featured credential and it leaves the document", async ({
    page,
    resume,
  }) => {
    await gotoApp(page, "/resume");
    // Anchored: the summary sentence names the credential too.
    const line = resume.article.getByText(new RegExp(`^${esc(DEMO.publicName)}`));
    await expect(line).toBeVisible();
    await resume.featured(DEMO.publicName).click();
    await expect(line).toHaveCount(0);
    await resume.featured(DEMO.publicName).click();
    await expect(line).toBeVisible();
  });

  // res-04
  test("visitor downloads the Markdown, copies the text and prints", async ({ page, resume }) => {
    await stubPrint(page);
    await gotoApp(page, "/resume");
    const file = await download(page, resume.markdown);
    expect(file.name).toBe("jordan-rivera-resume.md");
    expect(file.text.startsWith(`# ${DEMO.name}`)).toBe(true);
    await resume.copyText.click();
    await expect(toast(page, /^(Copied|Clipboard unavailable)$/)).toBeVisible();
    await resume.print.click();
    expect(await printed(page)).toBe(1);
  });
});

test.describe("Journey 7: Résumé — Admin", () => {
  // res-05
  test("admin writes a summary, saves it, finds it after a reload, and clears it", async ({
    page,
    resume,
  }) => {
    const text = `E2E summary ${stamp()}`;
    await gotoApp(page, "/resume");
    await resume.summary.fill(text);
    await resume.save.click();
    await expect(toast(page, "Summary saved")).toBeVisible();
    await gotoApp(page, "/resume");
    await expect(resume.summary).toHaveValue(text);
    await resume.clear.click();
    await resume.save.click();
    await expect(toast(page, "Summary saved")).toBeVisible();
    await gotoApp(page, "/resume");
    await expect(resume.summary).toHaveValue("");
  });

  // res-06
  test("admin asks for a draft and gets text or a named error, never silence", async ({
    page,
    resume,
  }) => {
    test.setTimeout(180_000);
    await gotoApp(page, "/resume");
    await resume.draft.click();
    await expect
      .poll(
        async () =>
          (await resume.summary.inputValue()) !== "" || (await toast(page, /./).count()) > 0,
        {
          timeout: 120_000,
          message: "Draft for me neither filled the summary nor reported an error",
        },
      )
      .toBe(true);
    await expect(resume.draft).toHaveText("Draft for me", { timeout: 120_000 });
  });
});
