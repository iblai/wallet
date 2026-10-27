import type { Locator, Page } from "@playwright/test";
import { content } from "../utils/app";

/** The Coach (the SDK chat, or its empty states) and the agents browser. */
export class CoachPage {
  readonly page: Page;
  readonly noAgent: Locator;
  readonly chooseAgent: Locator;
  readonly needsPlatform: Locator;
  readonly memberHint: Locator;
  readonly composer: Locator;
  readonly agentsHeading: Locator;
  readonly agentsSearch: Locator;
  readonly createCustom: Locator;

  constructor(page: Page) {
    this.page = page;
    this.noAgent = page.getByRole("heading", { level: 2, name: "No agent for the Coach yet" });
    this.chooseAgent = page
      .getByRole("button", { name: "Choose an agent" })
      .or(page.getByRole("link", { name: "Choose an agent" }))
      .first();
    this.needsPlatform = page.getByRole("heading", {
      level: 2,
      name: "The Coach needs a platform",
    });
    this.memberHint = page.getByText("Ask an admin of this platform to choose one.");
    this.composer = content(page).getByRole("textbox").first();
    this.agentsHeading = page.getByText(/Discover and create agents/);
    this.agentsSearch = page
      .getByRole("textbox", { name: /search agents/i })
      .or(page.getByPlaceholder(/search agents/i))
      .first();
    this.createCustom = page.getByText("Create Custom Agent");
  }

  /** The agent cards of the SDK browser, labelled "Explore agent: <name>…". */
  agentCards(): Locator {
    return content(this.page).getByLabel(/^Explore agent: /);
  }
}
