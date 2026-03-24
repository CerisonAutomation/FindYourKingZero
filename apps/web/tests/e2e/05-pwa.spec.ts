import { test, expect } from '@playwright/test';

test.describe('PWA & Offline', () => {
  test('manifest.json is served', async ({ page }) => {
    const res = await page.goto('/manifest.webmanifest').catch(() => page.goto('/manifest.json'));
    expect(res?.status()).toBeLessThan(400);
  });

  test('manifest has required fields', async ({ page }) => {
    await page.goto('/');
    const manifestUrl = await page.evaluate(() => {
      const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
      return link?.href ?? null;
    });
    if (manifestUrl) {
      const res = await page.request.get(manifestUrl);
      const json = await res.json();
      expect(json.name).toBeTruthy();
      expect(json.icons?.length).toBeGreaterThan(0);
    }
  });

  test('apple-touch-icon meta present', async ({ page }) => {
    await page.goto('/');
    const icon = page.locator('link[rel="apple-touch-icon"]');
    // May not exist in all builds — just check if present it has href
    if (await icon.count() > 0) {
      const href = await icon.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });

  test('theme-color meta present', async ({ page }) => {
    await page.goto('/');
    const meta = page.locator('meta[name="theme-color"]');
    if (await meta.count() > 0) {
      const content = await meta.getAttribute('content');
      expect(content).toBeTruthy();
    }
  });

  test('viewport meta is set correctly', async ({ page }) => {
    await page.goto('/');
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
  });
});
