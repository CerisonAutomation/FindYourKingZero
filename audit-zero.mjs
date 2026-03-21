import puppeteer from "puppeteer";
const BASE = "http://localhost:5173";
const PAGES = [
  { path: "/", expect: "landing" },
  { path: "/connect", expect: "auth" },
  { path: "/app", expect: "auth" },
  { path: "/app/grid", expect: "auth" },
  { path: "/app/right-now", expect: "auth" },
  { path: "/app/right-now/map", expect: "auth" },
  { path: "/app/messages", expect: "auth" },
  { path: "/app/events", expect: "auth" },
  { path: "/app/events/create", expect: "auth" },
  { path: "/app/profile/me", expect: "auth" },
  { path: "/app/profile/me/edit", expect: "auth" },
  { path: "/app/profile/me/photos", expect: "auth" },
  { path: "/app/notifications", expect: "auth" },
  { path: "/app/safety", expect: "auth" },
  { path: "/app/blocked", expect: "auth" },
  { path: "/app/reports", expect: "auth" },
  { path: "/app/settings", expect: "auth" },
  { path: "/app/settings/account", expect: "auth" },
  { path: "/app/settings/security", expect: "auth" },
  { path: "/app/settings/privacy", expect: "auth" },
  { path: "/app/settings/notifications", expect: "auth" },
  { path: "/app/settings/content", expect: "auth" },
  { path: "/app/settings/subscription", expect: "auth" },
  { path: "/app/favorites", expect: "auth" },
  { path: "/app/bookings", expect: "auth" },
  { path: "/app/verification", expect: "auth" },
  { path: "/app/albums", expect: "auth" },
  { path: "/app/analytics", expect: "auth" },
  { path: "/app/voice", expect: "auth" },
  { path: "/app/ai", expect: "auth" },
  { path: "/app/admin", expect: "auth" },
  { path: "/app/admin/reports", expect: "auth" },
  { path: "/app/admin/moderation", expect: "auth" },
  { path: "/app/admin/audit", expect: "auth" },
  { path: "/app/admin/metrics", expect: "auth" },
  { path: "/privacy", expect: "content" },
  { path: "/terms", expect: "content" },
  { path: "/cookies", expect: "content" },
  { path: "/onboarding", expect: "auth" },
  { path: "/auth/sign-in", expect: "content" },
  { path: "/auth/sign-up", expect: "content" },
  { path: "/nonexistent", expect: "404" },
];

let pass = 0, fail = 0;
const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });

for (const pg of PAGES) {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  try {
    const res = await page.goto(`${BASE}${pg.path}`, { waitUntil: "networkidle2", timeout: 15000 });
    const status = res?.status() || 0;
    const body = await page.evaluate(() => document.body?.innerText?.trim() || "");

    let ok = status === 200 && errors.length === 0;
    if (pg.expect === "404") ok = status === 200 && body.includes("404") && errors.length === 0;
    if (pg.expect === "auth") ok = status === 200 && (body.includes("Sign In") || body.includes("FIND YOUR KING")) && errors.length === 0;
    if (pg.expect === "content") ok = status === 200 && body.length > 50 && errors.length === 0;
    if (pg.expect === "landing") ok = status === 200 && body.length > 50 && errors.length === 0;

    if (ok) pass++; else fail++;
    console.log(`${ok ? "PASS" : "FAIL"} ${pg.path.padEnd(40)} [${status}] err:${errors.length}`);
    if (!ok) console.log(`  BODY: ${body.substring(0, 60)} ERR: ${errors.join(";")}`);
  } catch (e) { fail++; console.log(`FAIL ${pg.path.padEnd(40)} TIMEOUT`); }
  await page.close();
}
await browser.close();

console.log(`\n${"=".repeat(50)}`);
console.log(`  FINAL: ${pass}/${PAGES.length} PASS — ${fail} ERRORS`);
console.log(`${"=".repeat(50)}`);
process.exit(fail);
