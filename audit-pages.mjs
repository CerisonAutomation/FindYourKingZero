import puppeteer from "puppeteer";
const BASE = "http://localhost:5173";
const PAGES = [
  { path: "/", name: "Home" },
  { path: "/login", name: "Login" },
  { path: "/signup", name: "Signup" },
  { path: "/explore", name: "Explore" },
  { path: "/connect", name: "Connect" },
  { path: "/events", name: "Events" },
  { path: "/chat", name: "Chat" },
  { path: "/right-now", name: "Right Now" },
  { path: "/notifications", name: "Notifications" },
  { path: "/settings", name: "Settings" },
  { path: "/profile/me", name: "Profile Me" },
  { path: "/analytics", name: "Analytics" },
  { path: "/safety", name: "Safety" },
  { path: "/verification", name: "Verification" },
  { path: "/privacy", name: "Privacy" },
  { path: "/terms", name: "Terms" },
  { path: "/nonexistent", name: "404 Page" },
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
    const ok = status === 200 && body.length > 10 && errors.length === 0;
    if (ok) pass++; else fail++;
    console.log(`  ${ok ? "✅" : "❌"} ${pg.name} (${pg.path}) — ${status}${errors.length ? " — ERR: " + errors[0].substring(0, 80) : ""}`);
  } catch (e) {
    fail++;
    console.log(`  ❌ ${pg.name} (${pg.path}) — ${e.message.substring(0, 80)}`);
  }
  await page.close();
}
await browser.close();
console.log(`\n═══ RESULTS: ${pass}/${PAGES.length} passed (${Math.round(pass/PAGES.length*100)}%) ═══`);
process.exit(fail > 0 ? 1 : 0);
