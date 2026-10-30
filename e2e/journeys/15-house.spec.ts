import type { Page } from "@playwright/test";
import { test, expect } from "../fixtures/wallet-test";
import { APP_HOST, AUTH_HOST, DEMO } from "../fixtures/test-data";
import { esc, gotoApp } from "../utils/app";

/**
 * Journey 15 — House journeys: the first-run paths of an ibl.ai official app
 * (/iblai-vibe-house-journeys), the SIS's H1–H16 as house-01…house-16. A user
 * whose only organization is the community one (house-01, -02, -12, -13, -14),
 * a visitor on one they do not belong to (house-03, -04, -09), an admin's first
 * run (house-05, -06, -10, -11), a member's (house-07, -08), the session a $0
 * checkout returns to (house-15) and the credit menu's checkout (house-16). The
 * wallet names an organization by `?tenant=`, not by its path. Organization-wide
 * state is served with page.route and never written; the accounts' own metadata
 * writes are answered by the route too, so they stay fresh.
 */
const MAIN = process.env.NEXT_PUBLIC_MAIN_TENANT_KEY || "main";
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://wallet.iblai.me").replace(/\/+$/, "");
const stamp = Date.now().toString(36);
// Answers a navigation the test only inspects; a 204 never commits, and a click waits for it.
const stub = { contentType: "text/html", body: "<title>stub</title>" };

const home = new RegExp(`^${esc(APP_HOST)}/?(\\?|#|$)`);
const onboarding = new RegExp(`^${esc(APP_HOST)}/onboarding(/|\\?|#|$)`);

/** The organization the wallet works in once the shell is up. */
async function landedOrg(page: Page): Promise<string> {
  await gotoApp(page, "/");
  return page.evaluate(
    () => localStorage.getItem("app_tenant") || localStorage.getItem("tenant") || "",
  );
}

/** web-utils reads an organization's metadata from the membership list: serve `edit` there too. */
async function editListedMetadata(
  page: Page,
  edit: (metadata: Record<string, unknown>) => Record<string, unknown>,
) {
  await page.route(/\/api\/core\/users\/platforms\//, async (route) => {
    const res = await route.fetch();
    const all = (await res.json()) as { key: string; metadata?: Record<string, unknown> }[];
    await route.fulfill({
      response: res,
      json: all.map((p) => (p.key === MAIN ? p : { ...p, metadata: edit(p.metadata ?? {}) })),
    });
  });
}

/**
 * The member's session, told it belongs to the community organization only —
 * in storage and by the membership lists, which the SDK re-reads on every load.
 */
async function mainOnly(page: Page) {
  const entry = {
    key: MAIN,
    org: MAIN,
    platform_name: "ibl.ai",
    is_admin: false,
    show_paywall: true,
  };
  await page.route(/\/api\/ibl\/users\/manage\/platform\//, (route) =>
    route.fulfill({ json: [entry] }),
  );
  await page.route(/\/api\/core\/users\/platforms\//, async (route) => {
    const res = await route.fetch();
    const all = (await res.json()) as { key: string }[];
    await route.fulfill({ response: res, json: all.filter((p) => p.key === MAIN) });
  });
  await page.addInitScript((only: typeof entry) => {
    localStorage.setItem("tenants", JSON.stringify([only]));
    localStorage.setItem("tenant", only.key);
    localStorage.setItem("current_tenant", JSON.stringify(only));
    localStorage.removeItem("app_tenant");
  }, entry);
}

// An organization answer still in flight when a test ends must not fail the next one.
test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: "ignoreErrors" });
});

test.describe("Journey 15: House — a user whose only organization is the community one", () => {
  test.beforeEach(async ({ memberPage }) => {
    await mainOnly(memberPage);
  });

  // house-01
  test("lands on the community platform inside the shell, with the admin cluster shown", async ({
    memberPage,
  }) => {
    await gotoApp(memberPage, "/");
    await expect(memberPage).toHaveURL(home);
    await expect(memberPage.getByRole("button", { name: "Management" })).toBeVisible({
      timeout: 30_000,
    });
  });

  // house-12
  test("the community platform shows the sample: the admin rows, a filled Credentials list and the notice", async ({
    memberPage,
  }) => {
    await gotoApp(memberPage, "/credentials");
    await expect(memberPage.getByTestId("sample-notice")).toContainText(DEMO.name);
    await expect(
      memberPage.getByRole("heading", { level: 3, name: DEMO.publicName }).first(),
    ).toBeVisible({ timeout: 30_000 });
    await expect(memberPage.getByRole("button", { name: "Analytics" })).toBeVisible();
  });

  // house-13
  test("a write on the sample opens the upgrade dialog", async ({ memberPage }) => {
    await gotoApp(memberPage, "/credentials?filter=pending");
    await memberPage.getByRole("heading", { level: 3, name: DEMO.pendingName }).first().click();
    await memberPage.getByRole("button", { name: "Decline", exact: true }).click();
    await expect(
      memberPage.getByRole("dialog").filter({ hasText: "Upgrade for free" }),
    ).toBeVisible({ timeout: 15_000 });
  });

  // house-14
  test("the upgrade dialog's Upgrade for free opens this app's $0 checkout", async ({
    memberPage,
  }) => {
    let checkout = "";
    await memberPage.route(/credits-free-plan/, (route) => {
      checkout = route.request().url();
      return route.fulfill(stub);
    });
    await gotoApp(memberPage, "/");
    await memberPage
      .getByTestId("sample-notice")
      .getByRole("button", { name: "Create Your Platform" })
      .click();
    await memberPage.getByRole("dialog").getByRole("button", { name: "Upgrade for free" }).click();
    await expect
      .poll(() => checkout)
      .toContain("/api/service/stripe/checkout/redirect/credits-free-plan/");
    const back = new URL(new URL(checkout).searchParams.get("redirect_url") ?? "");
    expect(back.searchParams.get("app")).toBe("mentor");
    expect(back.searchParams.get("redirect-to")).toBe(APP_URL);
  });

  // house-02
  test("a trial-gated click opens the SDK upgrade dialog, and Escape closes it", async ({
    memberPage,
  }) => {
    await gotoApp(memberPage, "/");
    await memberPage.getByRole("button", { name: "Management" }).click();
    const dialog = memberPage.getByRole("dialog");
    await expect(dialog).toContainText("Upgrade for free", { timeout: 15_000 });
    await memberPage.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  });
});

test.describe("Journey 15: House — a visitor on an organization they do not belong to", () => {
  const stranger = `e2e-nowhere-${stamp}`;

  // house-03
  test("the platform is previewed, and Join goes to the auth page's join for it", async ({
    memberPage,
  }) => {
    let joinUrl = "";
    await memberPage.route(/\/join\?tenant=/, (route) => {
      joinUrl = route.request().url();
      return route.fulfill(stub);
    });
    await memberPage.goto(`${APP_HOST}/?tenant=${stranger}`);
    const preview = memberPage.getByTestId("organization-preview");
    await expect(preview).toBeVisible({ timeout: 30_000 });
    await expect(preview).toContainText(stranger);
    await preview.getByRole("button", { name: `Join ${stranger}` }).click();
    await expect.poll(() => joinUrl).toContain(`tenant=${stranger}`);
    expect(new URL(joinUrl).searchParams.get("redirect-to")).toContain(`tenant=${stranger}`);
  });

  // house-04
  test("Create Your Own Platform is ibl.ai's $0 sign-up with this app nested in the return address", async ({
    memberPage,
  }) => {
    let checkout = "";
    await memberPage.route(/credits-free-plan/, (route) => {
      checkout = route.request().url();
      return route.fulfill(stub);
    });
    await memberPage.goto(`${APP_HOST}/?tenant=${stranger}`);
    await memberPage
      .getByTestId("organization-preview")
      .getByRole("button", { name: "Create Your Own Platform" })
      .click({ timeout: 30_000 });
    await expect
      .poll(() => checkout)
      .toContain("/api/service/stripe/checkout/redirect/credits-free-plan/");
    const back = new URL(new URL(checkout).searchParams.get("redirect_url") ?? "");
    expect(back.searchParams.get("redirect-to")).toBe(APP_URL);
  });

  // house-09
  test("Back to My Platform leaves the preview for the user's own platform home", async ({
    memberPage,
  }) => {
    await memberPage.goto(`${APP_HOST}/?tenant=${stranger}`);
    await memberPage
      .getByTestId("organization-preview")
      .getByRole("link", { name: "Back to My Platform" })
      .click({ timeout: 30_000 });
    await expect(memberPage).toHaveURL(home, { timeout: 30_000 });
    await expect(memberPage.locator("nav h1").first()).toHaveText("Wallet", { timeout: 60_000 });
    await expect(memberPage.getByTestId("organization-preview")).toHaveCount(0);
  });
});

test.describe("Journey 15: House — an admin's first run", () => {
  // house-05
  test("a readably keyed platform is not asked its name: the first run is sector, team, done, and the home holds afterwards", async ({
    page,
  }) => {
    // The admin's record: never completed on read, every write kept here.
    const records: Record<string, unknown>[] = [];
    await page.route(/\/api\/core\/users\/platform-metadata\//, (route) => {
      if (route.request().method() === "GET") {
        return route.fulfill({ json: { username: "", platform_key: "", metadata: {} } });
      }
      const sent = route.request().postDataJSON() as { metadata?: Record<string, unknown> };
      records.push(sent.metadata ?? {});
      return route.fulfill({
        json: { username: "", platform_key: "", metadata: sent.metadata ?? {} },
      });
    });
    // The organization's metadata read without its sector; a write stays here.
    const sectors: unknown[] = [];
    await page.route(/\/api\/core\/orgs\/[^/]+\/metadata\//, async (route) => {
      const req = route.request();
      if (req.method() === "GET") {
        const res = await route.fetch();
        const body = (await res.json()) as { metadata?: Record<string, unknown> };
        const { sector: _unset, ...rest } = body.metadata ?? {};
        return route.fulfill({ response: res, json: { ...body, metadata: rest } });
      }
      const sent = req.postDataJSON() as { metadata?: { sector?: unknown } };
      sectors.push(sent.metadata?.sector);
      return route.fulfill({ json: { metadata: sent.metadata ?? {} } });
    });
    await editListedMetadata(page, ({ sector: _unset, ...rest }) => rest);
    const renames: unknown[] = [];
    await page.route(/\/api\/core\/platform\/$/, (route) => {
      renames.push(route.request().postDataJSON());
      return route.fulfill({ json: {} });
    });

    await page.goto(`${APP_HOST}/`);
    await expect(page).toHaveURL(onboarding, { timeout: 60_000 });
    await expect(page.getByRole("progressbar")).toBeVisible({ timeout: 30_000 });
    // The key is readable, so the name is known and the sector opens the flow.
    await expect(page.getByLabel("Organization name")).toHaveCount(0);
    await page.getByRole("radio", { name: "Higher Education" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { name: "Invite your team" })).toBeVisible();
    await page.getByRole("button", { name: /^(Continue|Skip for now)$/ }).click();
    await expect(page.getByTestId("onboarding-final-step")).toContainText("All Set", {
      timeout: 15_000,
    });
    await page.getByRole("button", { name: "Complete" }).click();
    await expect(page).toHaveURL(home, { timeout: 30_000 });
    // The record read still says "not completed": the home holds anyway.
    await page.waitForTimeout(5_000);
    await expect(page).toHaveURL(home);
    await expect(page.getByTestId("onboarding-page")).toHaveCount(0);
    expect(renames).toEqual([]);
    expect(sectors).toEqual(["higher_education"]);
    expect(records.at(-1)).toMatchObject({
      onboarding: { completed: true, sector: "higher_education", version: 1 },
    });
  });

  // house-06
  test("an admin who finished it stays home", async ({ page }) => {
    await page.route(/\/api\/core\/users\/platform-metadata\//, (route) =>
      route.request().method() === "GET"
        ? route.fulfill({
            json: { username: "", platform_key: "", metadata: { onboarding: { completed: true } } },
          })
        : route.continue(),
    );
    await gotoApp(page, "/");
    await expect(page).toHaveURL(home);
    await expect(page.getByTestId("onboarding-page")).toHaveCount(0);
  });

  // house-11
  test("a named platform whose sector is set gets only the team step and the finish", async ({
    page,
  }) => {
    await page.route(/\/api\/core\/orgs\/[^/]+\/metadata\//, async (route) => {
      if (route.request().method() !== "GET") return route.continue();
      const res = await route.fetch();
      const body = (await res.json()) as { metadata?: Record<string, unknown> };
      return route.fulfill({
        response: res,
        json: { ...body, metadata: { ...body.metadata, sector: "k12" } },
      });
    });
    await page.goto(`${APP_HOST}/onboarding?flow=admin`);
    await expect(page.getByRole("heading", { name: "Invite your team" })).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByRole("progressbar")).toHaveAttribute("aria-label", "Step 1 of 2");
    await expect(page.getByRole("button", { name: "Back" })).toHaveCount(0);
  });

  // house-10
  test("Management › Onboarding opens for the admin, its agent links based on this app's onboarding route", async ({
    page,
  }) => {
    await gotoApp(page, "/");
    await page.getByRole("button", { name: "Management", exact: true }).click();
    const management = page.getByRole("dialog").filter({ hasText: "Management" }).first();
    await management
      .getByRole("tab", { name: "Onboarding" })
      .or(management.getByRole("button", { name: "Onboarding", exact: true }))
      .first()
      .click();
    // The copyable link shows once an agent is picked; until then the tab says so.
    const link = management.locator("code").filter({ hasText: "/onboarding/" }).first();
    const empty = management.getByText("No onboarding agent yet");
    await expect(link.or(empty).first()).toBeVisible({ timeout: 30_000 });
    if (await link.isVisible()) {
      expect(await link.textContent()).toMatch(new RegExp(`^${esc(APP_HOST)}/onboarding/`));
    } else {
      test.info().annotations.push({
        type: "note",
        description: "no onboarding agent picked on this organization: the link base is not shown",
      });
    }
    await page.keyboard.press("Escape");
  });
});

test.describe("Journey 15: House — a member's first run", () => {
  // house-07
  test("a member is sent to the platform's form, answers it, sees the final step and lands home", async ({
    memberPage,
  }) => {
    const form = {
      version: 1,
      enabled: true,
      title: "Welcome",
      sections: [
        {
          key: "about",
          title: "About you",
          fields: [{ key: "role", type: "text", label: "Your role", required: true }],
        },
      ],
      agents: [],
    };
    // The organization's metadata, with the form added on every read and the
    // member's answers kept once written — nothing reaches the platform.
    let written: Record<string, unknown> = {};
    await memberPage.route(/\/api\/core\/orgs\/[^/]+\/metadata\//, async (route) => {
      const req = route.request();
      if (req.method() === "GET") {
        const res = await route.fetch();
        const body = (await res.json()) as { metadata?: Record<string, unknown> };
        return route.fulfill({
          response: res,
          json: { ...body, metadata: { ...body.metadata, ...written, user_onboarding_form: form } },
        });
      }
      const sent = req.postDataJSON() as { metadata?: Record<string, unknown> } | null;
      written = sent?.metadata ?? sent ?? {};
      return route.fulfill({ json: { metadata: written } });
    });
    await editListedMetadata(memberPage, (metadata) => ({
      ...metadata,
      ...written,
      user_onboarding_form: form,
    }));
    await memberPage.goto(`${APP_HOST}/`);
    await expect(memberPage).toHaveURL(onboarding, { timeout: 60_000 });
    await memberPage.getByLabel("Your role").fill("Member");
    await memberPage.getByRole("button", { name: /^(Submit|Continue)$/ }).click();
    await expect(memberPage.getByTestId("onboarding-final-step")).toContainText("All Set", {
      timeout: 15_000,
    });
    await memberPage.getByRole("button", { name: "Continue" }).click();
    await expect(memberPage).toHaveURL(home, { timeout: 30_000 });
  });

  // house-08
  test("with nothing configured, /onboarding says so and Continue goes home", async ({
    memberPage,
  }) => {
    await memberPage.goto(`${APP_HOST}/onboarding`);
    const empty = memberPage.getByTestId("user-onboarding-empty");
    await expect(empty).toBeVisible({ timeout: 60_000 });
    await empty.getByRole("button").click();
    await expect(memberPage).toHaveURL(home, { timeout: 30_000 });
  });
});

test.describe("Journey 15: House — the session a $0 checkout returns to", () => {
  // house-15
  test("still on the community platform while the platform lists their own, the SDK moves them to it", async ({
    page,
  }) => {
    await page.route(`${AUTH_HOST}/**`, (route) => route.fulfill(stub));
    const own = await landedOrg(page);
    const keys = await page.evaluate(() =>
      (JSON.parse(localStorage.getItem("tenants") ?? "[]") as { key: string }[]).map((t) => t.key),
    );
    // The SDK's two-platform rule: a user holding exactly [main, X] is moved to X.
    expect(keys.sort()).toEqual([MAIN, own].sort());
    await page.evaluate((main) => {
      const entry = { key: main, org: main, platform_name: "ibl.ai", is_admin: false };
      localStorage.setItem("tenant", main);
      localStorage.setItem("current_tenant", JSON.stringify(entry));
      localStorage.setItem("tenants", JSON.stringify([entry]));
      localStorage.removeItem("app_tenant");
    }, MAIN);
    await page.goto(`${APP_HOST}/`);
    await page.waitForURL(/\/login\/complete\?/, { timeout: 30_000 });
    expect(new URL(page.url()).searchParams.get("tenant")).toBe(own);
  });
});

test.describe("Journey 15: House — the credit menu's checkout", () => {
  // house-16
  test("Upgrade Plan asks for a pricing page that returns through the sign-in app", async ({
    page,
  }) => {
    let session = "";
    // The admin's organization behind the paywall, on a free trial: the badge offers Upgrade Plan.
    await page.route(/\/api\/core\/users\/platforms\//, async (route) => {
      const res = await route.fetch();
      const all = (await res.json()) as { key: string }[];
      await route.fulfill({
        response: res,
        json: all.map((p) => (p.key === MAIN ? p : { ...p, show_paywall: true })),
      });
    });
    await page.route(/\/api\/billing\/account\//, (route) =>
      route.fulfill({
        json: {
          platform_key: new URL(route.request().url()).searchParams.get("platform_key"),
          available_credits: 100,
          has_credits: true,
          current_plan: "Free Trial",
          free_trial: true,
        },
      }),
    );
    // Answered like the platform answers a refused return, so nothing navigates.
    await page.route(/\/stripe\/pricing-page-session\//, (route) => {
      session = route.request().url();
      return route.fulfill({ status: 400, json: { redirect_url: "stubbed" } });
    });
    await landedOrg(page);
    // The badge reads the stored membership this first load wrote.
    await gotoApp(page, "/");
    await page.getByRole("button", { name: /credits remaining/i }).click({ timeout: 30_000 });
    await page.getByRole("button", { name: "Upgrade Plan" }).click();
    await expect.poll(() => session).toContain("/stripe/pricing-page-session/");
    const back = new URL(new URL(session).searchParams.get("redirect_url") ?? "");
    expect(back.searchParams.get("app")).toBe("mentor");
    expect(back.searchParams.get("redirect-to")).toBe(APP_URL);
  });
});
