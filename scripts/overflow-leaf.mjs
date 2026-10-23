import { chromium } from "@playwright/test";
const base = process.env.BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch({ channel: "chrome" });
for (const [width, paths] of [
  [390, ["/", "/credentials", "/credentials/import", "/share", "/p/demo-wallet/jordan.rivera"]],
  [1024, ["/", "/credentials", "/profile"]],
]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const path of paths) {
    await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    const r = await page.evaluate(() => {
      const vw = innerWidth;
      const leaf = [...document.querySelectorAll("body *")].filter((e) => {
        const b = e.getBoundingClientRect();
        return b.right > vw + 1 && b.width > 0;
      });
      const deepest = leaf.filter(
        (e) => ![...e.children].some((c) => c.getBoundingClientRect().right > vw + 1),
      );
      return {
        pageOverflow: document.documentElement.scrollWidth - vw,
        deepest: deepest.slice(0, 6).map((e) => ({
          tag: e.tagName,
          cls: (e.className || "").toString().slice(0, 80),
          text: (e.textContent || "").trim().slice(0, 30),
          right: Math.round(e.getBoundingClientRect().right),
        })),
      };
    });
    console.log(`[${width}] ${path}`, JSON.stringify(r));
  }
  await page.close();
}
await browser.close();
