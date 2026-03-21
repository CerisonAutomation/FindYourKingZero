import puppeteer from "puppeteer";
const BASE = "http://localhost:5173";
const PAGES = [
  "/", "/connect", "/explore", "/events", "/chat", "/right-now",
  "/notifications", "/settings", "/profile/me", "/analytics",
  "/safety", "/verification", "/privacy", "/terms", "/cookies",
  "/bookings", "/favorites", "/albums", "/voice", "/ai",
  "/admin", "/admin/audit", "/admin/metrics", "/admin/moderation", "/admin/reports",
  "/settings/account", "/settings/privacy", "/settings/security", "/settings/subscription",
  "/settings/notifications", "/settings/content",
  "/right-now/map", "/grid", "/messages",
  "/onboarding", "/blocked", "/reports",
];

let pass = 0, fail = 0, warns = 0;
const issues = [];
const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });

for (const path of PAGES) {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text().substring(0, 100)); });
  try {
    const res = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle2", timeout: 15000 });
    const status = res?.status() || 0;
    const body = await page.evaluate(() => document.body?.innerText?.trim() || "");
    const hasUI = await page.evaluate(() => document.querySelectorAll("button, a, input, [role]").length > 0);
    const ok = status === 200 && body.length > 10;
    if (ok && errors.length === 0) pass++;
    else if (ok && errors.length > 0) { warns++; issues.push({ path, errors: errors.slice(0, 3) }); }
    else { fail++; issues.push({ path, status, errors: errors.slice(0, 3) }); }
    console.log(`  ${ok ? (errors.length > 0 ? "⚠️" : "✅") : "❌"} ${path} [${status}] ${body.length}ch ${hasUI ? "UI✓" : ""} ${errors.length}err`);
  } catch (e) { fail++; console.log(`  ❌ ${path} — ${e.message.substring(0, 60)}`); }
  await page.close();
}
await browser.close();
console.log(`\n═══ AUDIT: ${pass}✅ ${warns}⚠️ ${fail}❌ / ${PAGES.length} total (${Math.round(pass/PAGES.length*100)}%) ═══`);
if (issues.length) { console.log("\nISSUES:"); issues.forEach(i => console.log(`  ${i.path}: ${i.errors?.join("; ")}`)); }
