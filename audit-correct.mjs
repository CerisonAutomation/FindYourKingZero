import puppeteer from "puppeteer";
const BASE = "http://localhost:5173";
const PAGES = [
  "/", "/connect", "/app", "/app/grid", "/app/right-now", "/app/right-now/map",
  "/app/messages", "/app/events", "/app/events/create",
  "/app/profile/me", "/app/profile/me/edit", "/app/profile/me/photos",
  "/app/notifications", "/app/safety", "/app/blocked", "/app/reports",
  "/app/settings", "/app/settings/account", "/app/settings/security",
  "/app/settings/privacy", "/app/settings/notifications", "/app/settings/content",
  "/app/settings/subscription", "/app/favorites", "/app/bookings",
  "/app/verification", "/app/albums", "/app/analytics", "/app/voice", "/app/ai",
  "/app/admin", "/app/admin/reports", "/app/admin/moderation", "/app/admin/audit", "/app/admin/metrics",
  "/privacy", "/terms", "/cookies", "/onboarding",
  "/auth/sign-in", "/auth/sign-up",
  "/nonexistent",
];

let pass = 0, fail = 0, warns = 0;
const issues = [];
const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });

for (const path of PAGES) {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  try {
    const res = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle2", timeout: 15000 });
    const status = res?.status() || 0;
    const body = await page.evaluate(() => document.body?.innerText?.trim() || "");
    const hasUI = await page.evaluate(() => document.querySelectorAll("button, a, input, [role]").length > 0);
    const is404 = body.includes("Page not found") || body.includes("404");
    const ok = status === 200 && body.length > 10 && !is404 && errors.length === 0;
    if (ok) pass++;
    else if (status === 200 && !is404 && errors.length > 0) { warns++; issues.push({ path, err: errors[0]?.substring(0, 60) }); }
    else { fail++; issues.push({ path, reason: is404 ? "404 React" : `HTTP ${status}`, err: errors[0]?.substring(0, 60) }); }
    const icon = ok ? "✅" : (is404 ? "❌" : "⚠️");
    console.log(`  ${icon} ${path.padEnd(35)} [${status}] ${body.substring(0, 40)}${body.length > 40 ? "..." : ""}`);
  } catch (e) { fail++; console.log(`  ❌ ${path.padEnd(35)} TIMEOUT`); }
  await page.close();
}
await browser.close();
console.log(`\n═══ ${pass}✅ ${warns}⚠️ ${fail}❌ / ${PAGES.length} (${Math.round(pass/PAGES.length*100)}%) ═══`);
if (issues.length) { console.log("\nISSUES:"); issues.forEach(i => console.log(`  ${i.path}: ${i.reason || "warn"} ${i.err || ""}`)); }
