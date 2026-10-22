// Capture the README screenshots from the sample wallet.
// Usage: NEXT_PUBLIC_WALLET_DEMO=true pnpm dev  (in another shell)  →  node scripts/screenshots.mjs
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const out = "docs/images";
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1400, height: 880 }, deviceScaleFactor: 2 });
const shot = async (name, path, prep) => {
  await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  if (prep) await prep();
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: false });
  console.log("captured", name);
};

await page.goto(`${base}/`, { waitUntil: "networkidle" });
await page.evaluate(() => {
  localStorage.removeItem("credential-wallet-demo-v1");
  localStorage.removeItem("demo_admin");
});

await shot("wallet", "/");
await shot("credentials", "/credentials");
await shot("credential", "/credentials/plat-91ab-ml-foundations");
await shot("skills", "/skills");
await shot("resume", "/resume");
await shot("share", "/share");
await shot("coach", "/coach", async () => {
  await page.getByText("What should I earn next?").first().click();
  await page.waitForTimeout(800);
});
await shot("public", "/p/demo-wallet/jordan.rivera");
await shot("verify", "/verify/plat-91ab-ml-foundations?org=demo-wallet&u=jordan.rivera");
await browser.close();
