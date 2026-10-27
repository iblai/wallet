import { expect, type Locator, type Page } from "@playwright/test";
import { SAMPLE_OB2_NAME, SAMPLE_OB3_NAME } from "../fixtures/test-data";
import { acceptConfirms, content, esc, gotoApp, toast } from "../utils/app";

/** Credentials: the list, the import page and a credential's own page. */
export class CredentialsPage {
  readonly page: Page;
  // The list
  readonly search: Locator;
  readonly collection: Locator;
  readonly sort: Locator;
  readonly emptyTitle: Locator;
  readonly addLink: Locator;
  // Import
  readonly jsonBox: Locator;
  readonly addToWallet: Locator;
  readonly recognized: Locator;
  readonly badgeUrl: Locator;
  readonly fetchBadge: Locator;
  // A credential's page
  readonly title: Locator;
  readonly pendingBanner: Locator;
  readonly accept: Locator;
  readonly decline: Locator;
  readonly shareButton: Locator;
  readonly shareDialog: Locator;
  readonly makePrivate: Locator;
  readonly makePublic: Locator;
  readonly exportOb3: Locator;
  readonly collectionsButton: Locator;
  readonly collectionsDialog: Locator;
  readonly remove: Locator;
  readonly notFound: Locator;

  constructor(page: Page) {
    this.page = page;
    this.search = page.getByRole("textbox", { name: "Search credentials" });
    this.collection = page.getByRole("combobox", { name: "Collection" });
    this.sort = page.getByRole("combobox", { name: "Sort" });
    this.emptyTitle = page.getByRole("heading", {
      level: 2,
      name: /^(No credentials yet|Nothing matches)$/,
    });
    // The header's link; the empty state repeats it.
    this.addLink = page.getByRole("link", { name: "Add credential" }).first();
    this.jsonBox = page.getByRole("textbox", { name: "Badge JSON" });
    this.addToWallet = page.getByRole("button", { name: /^(Add to wallet|Adding…)$/ });
    this.recognized = page.getByText("Recognized. This is what will be added:");
    this.badgeUrl = page.getByRole("textbox", { name: "Badge URL" });
    this.fetchBadge = page.getByRole("button", { name: /^(Fetch badge|Fetching…)$/ });
    this.title = content(page).getByRole("heading", { level: 1 });
    this.pendingBanner = page.getByText("issued this to you.");
    this.accept = page.getByRole("button", { name: "Accept", exact: true });
    this.decline = page.getByRole("button", { name: "Decline", exact: true });
    this.shareButton = page.getByRole("button", { name: "Share…" });
    this.shareDialog = page.getByRole("dialog", { name: /^Share / });
    this.makePrivate = page.getByRole("button", { name: "Make private" });
    this.makePublic = page.getByRole("button", { name: "Make public" });
    this.exportOb3 = page.getByRole("button", { name: "Open Badges 3.0 JSON" });
    this.collectionsButton = page.getByRole("button", { name: "Collections…" });
    this.collectionsDialog = page.getByRole("dialog", { name: "Collections" });
    this.remove = page.getByRole("button", { name: "Remove from wallet" });
    this.notFound = page.getByRole("heading", { level: 2, name: "Credential not found" });
  }

  /** A filter button, e.g. "All 7". */
  filter(label: string): Locator {
    return this.page.getByRole("button", { name: new RegExp(`^${esc(label)} \\d+$`) });
  }

  /** The cards: links around an h3 with the credential's name. */
  cards(): Locator {
    return content(this.page)
      .getByRole("link")
      .filter({ has: this.page.getByRole("heading", { level: 3 }) });
  }

  card(name: string): Locator {
    return content(this.page)
      .getByRole("link")
      .filter({ has: this.page.getByRole("heading", { level: 3, name, exact: true }) });
  }

  tab(name: string): Locator {
    return this.page.getByRole("tab", { name });
  }

  sample(version: "2.0" | "3.0"): Locator {
    return this.page.getByRole("button", { name: `Sample ${version}` });
  }

  /** The "Add manually" form labels are not linked to their inputs; the placeholders are the handles. */
  field(placeholder: string): Locator {
    return this.page.getByPlaceholder(placeholder);
  }

  /** A status or verification badge on the credential's page (the Verification section repeats the label). */
  badge(text: string): Locator {
    return content(this.page).getByText(text, { exact: true }).first();
  }

  visibility(): Locator {
    return this.page.locator("dt:text-is('Visibility') + dd");
  }

  async openCard(name: string): Promise<void> {
    await gotoApp(this.page, "/credentials");
    await this.card(name).first().click();
    await this.page.waitForURL((url) => /^\/credentials\/.+/.test(url.pathname), {
      timeout: 15_000,
    });
    await expect(this.title).toHaveText(name);
  }

  /** The import page, reached from the loaded list (the page itself does not wait for the wallet). */
  async openImport(): Promise<void> {
    await gotoApp(this.page, "/credentials");
    await this.addLink.click();
    await this.page.waitForURL((url) => url.pathname === "/credentials/import", {
      timeout: 15_000,
    });
  }

  /** Paste one of the import page's own samples and add it; lands on the new credential. */
  async importSample(version: "2.0" | "3.0"): Promise<string> {
    const name = version === "2.0" ? SAMPLE_OB2_NAME : SAMPLE_OB3_NAME;
    await this.openImport();
    await this.tab("Paste JSON").click();
    await this.sample(version).click();
    await expect(this.recognized).toBeVisible();
    await this.addToWallet.click();
    await expect(toast(this.page, `${name} added`)).toBeVisible();
    await this.page.waitForURL((url) => /^\/credentials\/.+/.test(url.pathname), {
      timeout: 15_000,
    });
    await expect(this.title).toHaveText(name);
    return name;
  }

  async acceptCurrent(): Promise<void> {
    await this.accept.click();
    await expect(toast(this.page, "Accepted and made public")).toBeVisible();
    await expect(this.badge("Active")).toBeVisible();
  }

  async removeCurrent(): Promise<void> {
    acceptConfirms(this.page);
    await this.remove.click();
    await expect(toast(this.page, "Removed")).toBeVisible();
    await this.page.waitForURL((url) => url.pathname === "/credentials", { timeout: 15_000 });
  }
}
