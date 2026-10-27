import type { Locator, Page } from "@playwright/test";
import { content } from "../utils/app";

/** The admin surfaces: Users, Organization, the organization's credentials, Analytics, and /setup. */
export class AdminPages {
  readonly page: Page;
  readonly pendingInvites: Locator;
  readonly inviteUser: Locator;
  readonly inviteDialog: Locator;
  readonly appName: Locator;
  readonly welcome: Locator;
  readonly supportUrl: Locator;
  readonly saveSettings: Locator;
  readonly issuedHeading: Locator;
  readonly canIssueHeading: Locator;
  readonly nothingIssued: Locator;
  readonly noDefinitions: Locator;
  readonly setupHeading: Locator;
  readonly searchAgents: Locator;
  readonly saveSetup: Locator;
  readonly cancelSetup: Locator;
  readonly createAgent: Locator;
  readonly useDefaultAgent: Locator;
  readonly adminOnly: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pendingInvites = page.getByRole("button", { name: "Pending invites" });
    this.inviteUser = page.getByRole("button", { name: "Invite user" });
    this.inviteDialog = page.getByRole("dialog", { name: "Invite Users" });
    this.appName = page.getByLabel("App name");
    this.welcome = page.getByLabel("Welcome message");
    this.supportUrl = page.getByLabel("Support URL");
    this.saveSettings = page
      .locator("form")
      .filter({ has: this.welcome })
      .getByRole("button", { name: /^(Save|Saving…)$/ });
    this.issuedHeading = page.getByRole("heading", { level: 2, name: /^Issued \(\d+\)$/ });
    this.canIssueHeading = page.getByRole("heading", {
      level: 2,
      name: /^Credentials this organization can issue \(\d+\)$/,
    });
    this.nothingIssued = page.getByRole("heading", { level: 2, name: "Nothing issued yet" });
    this.noDefinitions = page.getByRole("heading", { level: 2, name: "No credentials defined" });
    this.setupHeading = page.getByRole("heading", { name: "Which agent is the Coach?" });
    this.searchAgents = page.getByPlaceholder("Search Agents");
    this.saveSetup = page.getByRole("button", { name: /^(Save|Saving…)$/ });
    this.cancelSetup = page.getByRole("button", { name: "Cancel", exact: true });
    this.createAgent = page.getByRole("button", { name: "Create a new agent" });
    this.useDefaultAgent = page.getByRole("button", { name: "Use the platform's default agent" });
    this.adminOnly = page.getByText("Only admins of this platform can choose the Coach's agent.");
  }

  /** The setup grid's agent tiles: buttons around an h4 with the agent's name. */
  agentTiles(): Locator {
    return this.page
      .getByRole("button")
      .filter({ has: this.page.getByRole("heading", { level: 4 }) });
  }

  /** A tab of an SDK panel in the page body (the analytics strip, Management). */
  tab(name: string): Locator {
    const body = content(this.page);
    return body
      .getByRole("tab", { name, exact: true })
      .or(body.getByRole("button", { name, exact: true }))
      .or(body.getByRole("link", { name, exact: true }))
      .first();
  }
}
