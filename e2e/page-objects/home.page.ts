import type { Locator, Page } from "@playwright/test";
import { esc, section } from "../utils/app";

/** Home: the empty wallet, or the dashboard tiles and sections. */
export class HomePage {
  readonly page: Page;
  readonly emptyTitle: Locator;
  readonly addFirst: Locator;
  readonly greeting: Locator;
  readonly summary: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emptyTitle = page.getByRole("heading", { level: 2, name: /Your wallet is empty\./ });
    this.addFirst = page.getByRole("link", { name: "Add your first credential" });
    this.greeting = page.getByRole("heading", { level: 1, name: /^Hi / });
    this.summary = page.getByText(/\d+ credentials? · \d+ verified · \d+ skills on record/);
  }

  /** A stat tile is a link whose name starts with its label. */
  tile(label: string): Locator {
    return this.page.getByRole("link", { name: new RegExp(`^${esc(label)}`) });
  }

  section(title: string | RegExp): Locator {
    return section(this.page, title);
  }
}
