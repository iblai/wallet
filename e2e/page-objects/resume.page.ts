import type { Locator, Page } from "@playwright/test";
import { esc, section, switchFor } from "../utils/app";

/** Résumé: the summary box and its AI draft, the layout choices, the featured list and the printable document. */
export class ResumePage {
  readonly page: Page;
  readonly summary: Locator;
  readonly draft: Locator;
  readonly save: Locator;
  readonly clear: Locator;
  readonly copyText: Locator;
  readonly markdown: Locator;
  readonly print: Locator;
  readonly template: Locator;
  readonly article: Locator;

  constructor(page: Page) {
    this.page = page;
    this.summary = page.getByRole("textbox", { name: "Summary" });
    this.draft = page.getByRole("button", { name: /^(Draft for me|Drafting…)$/ });
    const summarySection = page.locator("section").filter({ has: this.summary });
    this.save = summarySection.getByRole("button", { name: "Save", exact: true });
    this.clear = summarySection.getByRole("button", { name: "Clear" });
    this.copyText = page.getByRole("button", { name: "Copy text" });
    this.markdown = page.getByRole("button", { name: "Markdown" });
    this.print = page.getByRole("button", { name: "Print / PDF" });
    this.template = section(page, "Layout").getByRole("combobox").first();
    this.article = page.locator("article#resume-print");
  }

  /** The section toggles are labelled in lowercase ("education"); CSS capitalises them. */
  sectionSwitch(
    label: "experience" | "Licenses & certifications" | "education" | "skills",
  ): Locator {
    return switchFor(this.page, label);
  }

  featured(name: string): Locator {
    return this.page.getByRole("checkbox", { name: new RegExp(`^${esc(name)}`) });
  }

  articleHeading(title: string): Locator {
    return this.article.getByRole("heading", { level: 2, name: title, exact: true });
  }
}
