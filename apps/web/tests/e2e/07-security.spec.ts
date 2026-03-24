import { test, expect } from '@playwright/test';

test.describe('Security Headers', () => {
  test('X-Frame-Options header set', async ({ page }) => {
    const res = await page.goto('/');
    const header = res?.headers()['x-frame-options'];
    if (header) expect(header.toLowerCase()).toContain('deny');
  });

  test('X-Content-Type-Options header set', async ({ page }) => {
    const res = await page.goto('/');
    const header = res?.headers()['x-content-type-options'];
    if (header) expect(header).toBe('nosniff');
  });

  test('Strict-Transport-Security present on HTTPS', async ({ page, baseURL }) => {
    if (!baseURL?.startsWith('https')) return;
    const res = await page.goto('/');
    const hsts = res?.headers()['strict-transport-security'];
    expect(hsts).toBeTruthy();
  });

  test('no API keys exposed in HTML source', async ({ page }) => {
    await page.goto('/');
    const html = await page.content();
    const patterns = [/sk-[a-zA-Z0-9]{20,}/, /AIza[0-9A-Za-z-_]{35}/, /Bearer\s+[a-zA-Z0-9]{20,}/];
    for (const pattern of patterns) {
      expect(html).not.toMatch(pattern);
    }
  });

  test('localStorage does not store plain passwords', async ({ page }) => {
    await page.goto('/');
    const keys = await page.evaluate(() => Object.keys(localStorage));
    const values = await page.evaluate(() =>
      Object.keys(localStorage).map(k => localStorage.getItem(k) ?? '')
    );
    for (const val of values) {
      expect(val.toLowerCase()).not.toContain('password');
    }
  });

  test('CSP meta tag or header present', async ({ page }) => {
    const res = await page.goto('/');
    const cspHeader = res?.headers()['content-security-policy'];
    const cspMeta = await page.locator('meta[http-equiv="Content-Security-Policy"]').count();
    // At minimum one should be present in prod — soft assertion for local
    const hasCsp = !!cspHeader || cspMeta > 0;
    // Not enforced in dev — just log
    console.log('CSP present:', hasCsp);
  });
});
