import { expect, type Locator, type Page } from "@playwright/test";
import { section, toast } from "../utils/app";

/** Skills: the tiles, the target role and its gap analysis, the three lists and the add dialog. */
export class SkillsPage {
  readonly page: Page;
  readonly selfReport: Locator;
  readonly addGoal: Locator;
  readonly targetRole: Locator;
  readonly previewNote: Locator;
  readonly makeTarget: Locator;
  readonly youHave: Locator;
  readonly gaps: Locator;
  readonly dialog: Locator;
  readonly searchSkills: Locator;

  constructor(page: Page) {
    this.page = page;
    this.selfReport = page.getByRole("button", { name: "Self-report a skill" });
    this.addGoal = page.getByRole("button", { name: "Add a goal" });
    this.targetRole = section(page, "Target role").getByRole("combobox").first();
    this.previewNote = page.getByText(/^Previewing /);
    this.makeTarget = page.getByRole("button", { name: "Make it my target" });
    this.youHave = page.getByText(/^You have \(\d+\)$/);
    this.gaps = page.getByText(/^Gaps \(\d+\)$/);
    this.dialog = page.getByRole("dialog", { name: /^(Self-report a skill|Add a skill goal)$/ });
    this.searchSkills = page.getByRole("textbox", { name: "Search skills" });
  }

  /** A stat tile's value: the element after its label (the tiles sit above the lists that reuse the words). */
  tileValue(label: string): Locator {
    return this.page
      .getByText(label, { exact: true })
      .first()
      .locator("xpath=following-sibling::*[1]");
  }

  list(title: "Evidenced" | "Self-reported" | "Goals"): Locator {
    return section(this.page, title);
  }

  /** The Remove button of one row of a list. */
  removeIn(title: "Evidenced" | "Self-reported" | "Goals", name: string): Locator {
    return this.list(title)
      .getByRole("listitem")
      .filter({ hasText: name })
      .getByRole("button", { name: "Remove" });
  }

  async addSkill(mode: "self" | "goal", name: string, level?: number): Promise<void> {
    await (mode === "self" ? this.selfReport : this.addGoal).click();
    await expect(this.dialog).toBeVisible();
    await this.searchSkills.fill(name);
    const suggestion = this.dialog.getByRole("button", { name, exact: true });
    if (await suggestion.count()) await suggestion.click();
    if (level) await this.dialog.getByRole("button", { name: `Level ${level}` }).click();
    await this.dialog.getByRole("button", { name: `Add ${name}` }).click();
    await expect(toast(this.page, `${name} added`)).toBeVisible();
  }
}
