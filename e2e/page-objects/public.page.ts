import type { Locator, Page } from "@playwright/test";
import { esc } from "../utils/app";

/** The outward-facing pages an employer opens cold: /p/<org>/<username> and /verify/<id>. */
export class PublicPages {
  readonly page: Page;
  readonly name: Locator;
  readonly notFound: Locator;
  readonly verifiable: Locator;
  readonly verdict: Locator;
  readonly credentialTitle: Locator;
  readonly issuerRecord: Locator;
  readonly holder: Locator;
  readonly noCredential: Locator;

  constructor(page: Page) {
    this.page = page;
    this.name = page.getByRole("main").getByRole("heading", { level: 1 });
    this.notFound = page.getByRole("heading", { level: 2, name: "No public wallet here" });
    this.verifiable = page.getByText(/\d+ of \d+ credentials independently verifiable/);
    this.verdict = page.getByRole("heading", { level: 1 });
    this.credentialTitle = page.getByRole("heading", { level: 2 }).first();
    this.issuerRecord = page.getByRole("heading", { level: 2, name: "Issuer's record" });
    this.holder = page.getByRole("heading", { level: 2, name: "Holder" });
    this.noCredential = page.getByRole("heading", { level: 2, name: "No credential to show" });
  }

  credentialsHeading(): Locator {
    return this.page.getByRole("heading", { level: 2, name: /^Credentials \(\d+\)$/ });
  }

  skillsHeading(): Locator {
    return this.page.getByRole("heading", { level: 2, name: /^Skills \(\d+\)$/ });
  }

  /** A credential on the public page: a link to its verify page, named after it. */
  credentialLink(name: string): Locator {
    return this.page.getByRole("link", { name: new RegExp(`^${esc(name)}`) });
  }
}
