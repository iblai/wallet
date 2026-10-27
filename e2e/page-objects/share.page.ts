import { expect, type Locator, type Page } from "@playwright/test";
import { section, switchFor, toast } from "../utils/app";

/** Share: the public page switch and link, the handle, the collection links, the public/private lists. */
export class SharePage {
  readonly page: Page;
  readonly publicSwitch: Locator;
  readonly link: Locator;
  readonly copyLink: Locator;
  readonly openPublic: Locator;
  readonly handle: Locator;
  readonly saveHandle: Locator;
  readonly handleError: Locator;
  readonly postLinkedIn: Locator;
  readonly exportBundle: Locator;
  readonly makePrivate: Locator;
  readonly makePublic: Locator;

  constructor(page: Page) {
    this.page = page;
    // The switch's label is its state.
    this.publicSwitch = switchFor(page, /^(On|Off)$/);
    this.link = page.locator("input[readonly]").first();
    this.copyLink = page.getByRole("button", { name: "Copy public link" });
    this.openPublic = page
      .getByRole("button", { name: "Open public page" })
      .or(page.getByRole("link", { name: "Open public page" }))
      .first();
    this.handle = page.getByRole("textbox", { name: "Display handle (shown on the page)" });
    this.saveHandle = page.getByRole("button", { name: "Save", exact: true });
    this.handleError = page.getByText("Lowercase letters, digits and dashes, 3–32 characters.");
    this.postLinkedIn = page
      .getByRole("button", { name: "Post on LinkedIn" })
      .or(page.getByRole("link", { name: "Post on LinkedIn" }))
      .first();
    this.exportBundle = page.getByRole("button", { name: "Export record (OB3 bundle)" });
    this.makePrivate = page.getByRole("button", { name: "Make private" });
    this.makePublic = page.getByRole("button", { name: "Make public" });
  }

  publicList(): Locator {
    return section(this.page, /^Public \(\d+\)$/);
  }

  privateList(): Locator {
    return section(this.page, /^Private \(\d+\)$/);
  }

  async setPublic(on: boolean): Promise<void> {
    if ((await this.publicSwitch.isChecked()) === on) return;
    await this.publicSwitch.click();
    await expect(toast(this.page, on ? "Public page is live" : "Public page is off")).toBeVisible();
  }
}
