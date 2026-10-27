import {
  expect,
  type BrowserContext,
  type Locator,
  type Page,
  type Response,
} from "@playwright/test";
import fs from "fs";
import { APP_HOST, E2E_CREDENTIAL, SAMPLE_ISSUER_HOST, SAMPLE_OB2 } from "../fixtures/test-data";

export const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The app's loading screen (components/loading-screen.tsx). */
export const loading = (page: Page) => page.getByRole("status", { name: "Loading" });
/** The top bar's page title. */
export const topTitle = (page: Page) => page.locator("nav h1").first();
/** The body of an (app) route: the inner <main> (the SDK inset is a <main> too). */
export const content = (page: Page) => page.getByRole("main").getByRole("main");
/** The first visible control or heading of an SDK panel in the page body (its phone tab bar is hidden on desktop). */
export const panelControl = (page: Page) => {
  const body = content(page);
  return body.getByRole("button").or(body.getByRole("tab")).or(body.getByRole("heading")).first();
};
/** A sonner toast carrying `text`. */
export const toast = (page: Page, text: string | RegExp) =>
  page.locator("[data-sonner-toast]").filter({ hasText: text });
/** A Base UI switch by its label (the label may name the hidden input, not the switch). */
export const switchFor = (page: Page, label: string | RegExp) =>
  page
    .getByRole("switch", { name: label })
    .or(
      page
        .getByText(label, { exact: true })
        .locator(
          "xpath=ancestor-or-self::*[following-sibling::*[@role='switch']][1]/following-sibling::*[@role='switch'][1]",
        ),
    )
    .first();
/** A <section> titled `title` (components/wallet/section.tsx). */
export const section = (page: Page, title: string | RegExp) =>
  page
    .locator("section")
    .filter({ has: page.getByRole("heading", { level: 2, name: title, exact: true }) });
/** Pick an option of the open Base UI select (its items live in a portaled listbox). */
export const pickOption = (page: Page, name: string | RegExp) =>
  page.getByRole("listbox").getByRole("option", { name, exact: true }).click();

/**
 * Open an (app) route and wait for the shell: the loading screen gone, the top-bar title on.
 * The platform throttles a fast walk (429); the app then shows the defaults — an empty
 * wallet — without a word, so a throttled read is retried and named after the third time.
 */
export async function gotoApp(page: Page, path = "/") {
  for (let attempt = 1; ; attempt++) {
    let throttled = false;
    const onResponse = (r: Response) => {
      if (r.status() === 429 && /platform-metadata|credentials\/orgs/.test(r.url()))
        throttled = true;
    };
    page.on("response", onResponse);
    await page.goto(`${APP_HOST}${path}`);
    await expect(loading(page)).toHaveCount(0, { timeout: 60_000 });
    await expect(topTitle(page)).toBeVisible();
    page.off("response", onResponse);
    if (!throttled) return;
    if (attempt === 3)
      throw new Error(`the platform throttled the wallet's reads on ${path} three times`);
    await page.waitForTimeout(2_000 * attempt);
  }
}

/** Open a route without the shell (/setup, /p, /verify) and wait for the loading screen to go. */
export async function gotoBare(page: Page, url: string) {
  await page.goto(url.startsWith("http") ? url : `${APP_HOST}${url}`);
  await expect(loading(page)).toHaveCount(0, { timeout: 60_000 });
}

/** The signed-in user's admin flag for the resolved organization (lib/iblai/tenant.ts). */
export function isAdmin(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    try {
      const tenants = JSON.parse(localStorage.getItem("tenants") ?? "[]") as {
        key: string;
        is_admin?: boolean;
      }[];
      const key = localStorage.getItem("app_tenant") || localStorage.getItem("tenant");
      return !!tenants.find((t) => t.key === key)?.is_admin;
    } catch {
      return false;
    }
  });
}

/** The signed-in username (never a token). */
export function username(page: Page): Promise<string> {
  return page.evaluate(() => {
    try {
      return String(JSON.parse(localStorage.getItem("userData") ?? "{}").user_nicename ?? "");
    } catch {
      return "";
    }
  });
}

const confirming = new WeakSet<Page>();
/** Accept every window.confirm() on the page (Remove from wallet asks one); one handler per page. */
export function acceptConfirms(page: Page) {
  if (confirming.has(page)) return;
  confirming.add(page);
  page.on("dialog", (d) => void d.accept());
}

/** Remove the credentials the journeys import, by their fixture names, the way a user would. */
export async function removeE2eCredentials(page: Page) {
  acceptConfirms(page);
  for (let i = 0; i < 12; i++) {
    await gotoApp(page, "/credentials");
    const card = content(page)
      .getByRole("link")
      .filter({ has: page.getByRole("heading", { level: 3, name: E2E_CREDENTIAL }) })
      .first();
    if ((await card.count()) === 0) return;
    await card.click();
    await page.getByRole("button", { name: "Remove from wallet" }).click();
    await expect(toast(page, "Removed")).toBeVisible();
    await page.waitForURL((url) => url.pathname === "/credentials", { timeout: 15_000 });
  }
}

/** Serve the sample issuer's badge for the browser's own fetches (import by link, verify). */
export function serveSampleIssuer(target: Page | BrowserContext) {
  return target.route(`${SAMPLE_ISSUER_HOST}/**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify(SAMPLE_OB2),
    }),
  );
}

/** The document is never wider than the phone: nothing scrolls sideways. */
export async function expectNoSidewaysOverflow(page: Page) {
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
  const [scroll, client] = await page.evaluate(() => [
    document.documentElement.scrollWidth,
    document.documentElement.clientWidth,
  ]);
  expect(scroll, `${page.url()} is wider than the viewport`).toBeLessThanOrEqual(client);
}

/** Open the phone sidebar sheet; measured in the SIS: right after a row navigated, the first tap is swallowed. */
export async function openSheet(page: Page) {
  const toggle = page.getByRole("button", { name: "Toggle Sidebar" });
  const sheet = page.getByRole("dialog", { name: "Sidebar" });
  await toggle.click();
  const opened = await sheet.waitFor({ state: "visible", timeout: 3_000 }).then(
    () => true,
    () => false,
  );
  if (!opened) {
    await toggle.click();
    await expect(sheet).toBeVisible({ timeout: 10_000 });
  }
  return sheet;
}

/** Click `trigger` and return the download it starts. */
export async function download(page: Page, trigger: Locator) {
  const [dl] = await Promise.all([page.waitForEvent("download"), trigger.click()]);
  return { name: dl.suggestedFilename(), text: fs.readFileSync(await dl.path(), "utf8") };
}

type Printable = Window & { __printed?: number };
/** Replace window.print with a counter on the next navigation. */
export function stubPrint(page: Page) {
  return page.addInitScript(() => {
    (window as Printable).__printed = 0;
    window.print = () => {
      (window as Printable).__printed = ((window as Printable).__printed ?? 0) + 1;
    };
  });
}
export const printed = (page: Page) => page.evaluate(() => (window as Printable).__printed ?? 0);
