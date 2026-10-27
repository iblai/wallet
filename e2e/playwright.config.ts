import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env.development") });

const APP_HOST = process.env.APP_HOST || "http://localhost:3000";
const CI = !!process.env.CI;
const DEMO = /@demo/;
const JOURNEYS = ["journeys/**/*.spec.ts"];
const MOBILE_SPEC = "journeys/12-mobile.spec.ts";
const state = (file: string) => path.resolve(__dirname, "../playwright/.auth", file);
// The Copy buttons' toasts need the clipboard; only Chromium can grant it.
const clipboard = { permissions: ["clipboard-read", "clipboard-write"] };

/**
 * Playwright configuration.
 *
 * Sign-in runs once per browser (the setup projects) and saves the admin's and
 * the member's storage state; the journeys inherit it. The `demo` project needs
 * no account: it runs the @demo describes on the sample wallet.
 *
 *   pnpm test:e2e        # Chrome desktop, a phone and the demo (chromium, mobile, demo)
 *   pnpm test:e2e:demo   # the demo journeys only (what CI runs)
 *   pnpm test:e2e:all    # every browser; --project=<name> on any script adds one
 *   pnpm test:e2e:ui     # interactive UI
 *   pnpm test:e2e:headed # headed Chrome
 *
 * Edit e2e/.env.development to configure APP_HOST and the accounts.
 */
export default defineConfig({
  testDir: ".",
  // A wallet page waits for ~10 platform reads on its first load; the admin pages for the SDK panels.
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: 1,
  reporter: CI ? [["list"], ["github"]] : [["list"]],
  use: {
    baseURL: APP_HOST,
    locale: "en-US",
    timezoneId: "UTC",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  // CI serves the fresh production build on APP_HOST's port; locally the running `pnpm dev` is reused.
  webServer: CI
    ? {
        command: `pnpm start --port ${new URL(APP_HOST).port || "3000"}`,
        url: APP_HOST,
        timeout: 120_000,
      }
    : undefined,
  projects: [
    // Sign-in — one per browser, runs once and saves the storage state
    { name: "setup-chromium", testMatch: /auth\.setup\.ts/, use: { ...devices["Desktop Chrome"] } },
    { name: "setup-firefox", testMatch: /auth\.setup\.ts/, use: { ...devices["Desktop Firefox"] } },
    { name: "setup-webkit", testMatch: /auth\.setup\.ts/, use: { ...devices["Desktop Safari"] } },

    // Journeys — signed in as the admin (the member through the memberPage fixture)
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...clipboard,
        storageState: state("user-setup-chromium.json"),
      },
      dependencies: ["setup-chromium"],
      testMatch: JOURNEYS,
      testIgnore: [MOBILE_SPEC],
      grepInvert: DEMO,
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"], storageState: state("user-setup-firefox.json") },
      dependencies: ["setup-firefox"],
      testMatch: JOURNEYS,
      testIgnore: [MOBILE_SPEC],
      grepInvert: DEMO,
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"], storageState: state("user-setup-webkit.json") },
      dependencies: ["setup-webkit"],
      testMatch: JOURNEYS,
      testIgnore: [MOBILE_SPEC],
      grepInvert: DEMO,
    },

    // A phone — one Chromium device on the chromium sign-in; the mobile journey only.
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], ...clipboard, storageState: state("user-setup-chromium.json") },
      dependencies: ["setup-chromium"],
      testMatch: [MOBILE_SPEC],
      grepInvert: DEMO,
    },

    // The sample wallet — no sign-in, no platform call: the @demo describes of every journey.
    {
      name: "demo",
      use: {
        ...devices["Desktop Chrome"],
        ...clipboard,
        storageState: { cookies: [], origins: [] },
      },
      testMatch: JOURNEYS,
      grep: DEMO,
    },
  ],
});
