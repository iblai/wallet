import { test as base, expect, type Page } from "@playwright/test";
import path from "path";
import { MEMBER_SKIP, hasMember } from "./test-data";
import { AdminPages } from "../page-objects/admin.page";
import { CoachPage } from "../page-objects/coach.page";
import { CredentialsPage } from "../page-objects/credentials.page";
import { HomePage } from "../page-objects/home.page";
import { PublicPages } from "../page-objects/public.page";
import { ResumePage } from "../page-objects/resume.page";
import { SharePage } from "../page-objects/share.page";
import { ShellPage } from "../page-objects/shell.page";
import { SkillsPage } from "../page-objects/skills.page";

export { expect };

const AUTH_DIR = path.resolve(__dirname, "../../playwright/.auth");
const NO_STATE = { cookies: [], origins: [] };

/** Every page object on one Page — the admin's `page`, the member's or a public one. */
export function pages(page: Page) {
  return {
    page,
    shell: new ShellPage(page),
    home: new HomePage(page),
    credentials: new CredentialsPage(page),
    skills: new SkillsPage(page),
    resume: new ResumePage(page),
    share: new SharePage(page),
    pub: new PublicPages(page),
    admin: new AdminPages(page),
    coach: new CoachPage(page),
  };
}

type Fixtures = Omit<ReturnType<typeof pages>, "page"> & {
  /** A second context signed in as the member test account; skips when there is none. */
  memberPage: Page;
  /** A fresh context with no session: an employer on a share link, or a signed-out visitor. */
  publicPage: Page;
  demoEnv: void;
};

export const test = base.extend<Fixtures>({
  shell: async ({ page }, use) => use(new ShellPage(page)),
  home: async ({ page }, use) => use(new HomePage(page)),
  credentials: async ({ page }, use) => use(new CredentialsPage(page)),
  skills: async ({ page }, use) => use(new SkillsPage(page)),
  resume: async ({ page }, use) => use(new ResumePage(page)),
  share: async ({ page }, use) => use(new SharePage(page)),
  pub: async ({ page }, use) => use(new PublicPages(page)),
  admin: async ({ page }, use) => use(new AdminPages(page)),
  coach: async ({ page }, use) => use(new CoachPage(page)),
  memberPage: async ({ browser, browserName }, use, testInfo) => {
    testInfo.skip(!hasMember, MEMBER_SKIP);
    const context = await browser.newContext({
      storageState: path.join(AUTH_DIR, `member-${browserName}.json`),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  publicPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: NO_STATE });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  // The @demo describes run the sample wallet: lib/iblai/config.ts reads window.__ENV__ before the build-time env.
  demoEnv: [
    async ({ context }, use, testInfo) => {
      if (testInfo.tags.includes("@demo")) {
        await context.addInitScript(() => {
          window.__ENV__ = { NEXT_PUBLIC_WALLET_DEMO: "true" };
        });
      }
      await use();
    },
    { auto: true },
  ],
});
