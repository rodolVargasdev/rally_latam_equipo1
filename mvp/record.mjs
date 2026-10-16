// Records one full night of the pocketNode MVP to video/pocketnode-mvp.webm.
import { chromium } from "playwright";
import { mkdir, rename, rm } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const outDir = path.join(root, "video");
const tmpDir = path.join(outDir, "tmp");
const size = { width: 1280, height: 800 };

await mkdir(tmpDir, { recursive: true });
// PW_CHANNEL=msedge uses the installed Edge when the Playwright browser cannot be downloaded.
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined });
const context = await browser.newContext({ viewport: size, recordVideo: { dir: tmpDir, size } });
const page = await context.newPage();
await page.goto(pathToFileURL(path.join(root, "mvp", "index.html")).href);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(800);
await page.evaluate(() => window.__mvpPlay());
await page.waitForFunction(() => window.__mvpDone === true, null, { timeout: 90_000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: path.join(outDir, "pocketnode-mvp-final.png") });
const video = page.video();
await context.close();
await browser.close();
await rename(await video.path(), path.join(outDir, "pocketnode-mvp.webm"));
await rm(tmpDir, { recursive: true, force: true });
console.log("Video: video/pocketnode-mvp.webm");
