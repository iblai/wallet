import { expect, type Locator, type Page } from "@playwright/test";

/** The OS shell around every (app) page: the sidebar rows, the top bar, the User/Admin switch, the phone sheet. */
export class ShellPage {
  readonly page: Page;
  readonly nav: Locator;
  readonly title: Locator;
  readonly adminSwitch: Locator;
  readonly moreOptions: Locator;
  readonly bell: Locator;
  readonly addCredential: Locator;
  readonly collapse: Locator;
  readonly expand: Locator;
  readonly toggleSidebar: Locator;
  readonly sheet: Locator;
  readonly demoBanner: Locator;
  readonly resetDemo: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nav = page.getByRole("navigation", { name: "Main navigation" });
    this.title = page.locator("nav h1").first();
    this.adminSwitch = page.getByRole("switch", { name: "Admin mode" });
    this.moreOptions = page.getByRole("button", { name: "More options" });
    this.bell = page.getByRole("button", { name: /^\d+ Notifications?$/ });
    this.addCredential = this.nav.getByRole("button", { name: "Add credential" });
    this.collapse = page.getByRole("button", { name: "Collapse sidebar" });
    this.expand = page.getByRole("button", { name: "Expand sidebar" });
    this.toggleSidebar = page.getByRole("button", { name: "Toggle Sidebar" });
    this.sheet = page.getByRole("dialog", { name: "Sidebar" });
    this.demoBanner = page.getByText("Demo wallet.");
    this.resetDemo = page.getByRole("button", { name: "Reset sample data" });
  }

  /** A sidebar row: the rows are buttons, the active one carries aria-current="page". */
  row(label: string): Locator {
    return this.nav.getByRole("button", { name: label, exact: true });
  }

  /** An item of the Analytics menu (the SDK renders them as links or buttons). */
  item(label: string): Locator {
    return this.nav
      .getByRole("button", { name: label, exact: true })
      .or(this.nav.getByRole("link", { name: label, exact: true }))
      .first();
  }

  /** A dialog opened from the shell (Invite Users, Management, Integrations, Advanced). */
  dialog(name: string | RegExp): Locator {
    return this.page.getByRole("dialog", { name });
  }

  async open(label: string, path: string): Promise<void> {
    await this.row(label).first().click();
    await this.page.waitForURL((url) => url.pathname === path, { timeout: 15_000 });
    await expect(this.row(label).first()).toHaveAttribute("aria-current", "page");
  }

  async setAdminMode(on: boolean): Promise<void> {
    await expect(this.adminSwitch).toBeVisible();
    if ((await this.adminSwitch.isChecked()) !== on) await this.adminSwitch.click();
    await expect(this.adminSwitch).toHaveAttribute("aria-checked", String(on));
  }
}
