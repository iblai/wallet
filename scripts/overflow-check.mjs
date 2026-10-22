// Report elements that overflow their box (text or chips spilling out) on
// every page at several widths. Run against the sample wallet.
import { chromium } from "@playwright/test";
const base = process.env.BASE_URL ?? "http://localhost:3000";
const pages = ["/", "/credentials", "/credentials/plat-91ab-ml-foundations", "/credentials/import", "/skills", "/resume", "/share", "/coach", "/profile", "/p/demo-wallet/jordan.rivera", "/verify/plat-91ab-ml-foundations?org=demo-wallet&u=jordan.rivera"];
const widths = [1280, 1024, 820, 390];
const browser = await chromium.launch({ channel: "chrome" });
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const path of pages) {
    await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    const bad = await page.evaluate(() =>
      [...document.querySelectorAll("body *")]
        .filter((e) => {
          const cs = getComputedStyle(e);
          const cls = (e.className || "").toString();
          return e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 2 && !/truncate|overflow-x-auto|overflow-auto|overflow-hidden/.test(cls) && cs.overflowX === "visible" && !["INPUT", "TEXTAREA", "HTML", "BODY"].includes(e.tagName);
        })
        .slice(0, 8)
        .map((e) => ({ tag: e.tagName, cls: (e.className || "").toString().slice(0, 70), text: (e.textContent || "").trim().slice(0, 28), sw: e.scrollWidth, cw: e.clientWidth })),
    );
    const docOverflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (bad.length || docOverflow > 0) console.log(`\n[${width}] ${path} pageOverflow=${docOverflow}px`, JSON.stringify(bad));
  }
  await page.close();
}
await browser.close();
console.log("\nscan done");
