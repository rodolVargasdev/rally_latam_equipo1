// Records each MVP page to video/<name>.webm, with review stills at fixed seconds.
// Usage: node mvp/record.mjs [page-name]   (no argument records every page)
import { chromium } from "playwright";
import { mkdir, rename, rm } from "node:fs/promises";
import { pathToFileURL, fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "video");
const size = { width: 1280, height: 800 };
const PAGES = [
  { file: "index.html", name: "pocketnode-red", stills: [9, 25, 36, 52] },
  { file: "vista-cercana.html", name: "pocketnode-vista-cercana", stills: [26] },
];
const only = process.argv[2];

// PW_CHANNEL=msedge uses the installed Edge when the Playwright browser cannot be downloaded.
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined });
for (const p of PAGES.filter(p => !only || p.name === only)) {
  const tmpDir = path.join(outDir, "tmp-" + p.name);
  await mkdir(tmpDir, { recursive: true });
  const context = await browser.newContext({ viewport: size, recordVideo: { dir: tmpDir, size } });
  const page = await context.newPage();
  await page.goto(pathToFileURL(path.join(root, "mvp", p.file)).href);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  const t0 = Date.now();
  await page.evaluate(() => window.__mvpPlay());
  for (const s of p.stills) {
    await page.waitForTimeout(Math.max(0, s * 1000 - (Date.now() - t0)));
    await page.screenshot({ path: path.join(outDir, `${p.name}-${String(s).padStart(2, "0")}s.png`) });
  }
  await page.waitForFunction(() => window.__mvpDone === true, null, { timeout: 120_000 });
  await page.waitForTimeout(1500);
  const video = page.video();
  await context.close();
  await rename(await video.path(), path.join(outDir, p.name + ".webm"));
  await rm(tmpDir, { recursive: true, force: true });
  console.log("Video: video/" + p.name + ".webm");
}
await browser.close();
