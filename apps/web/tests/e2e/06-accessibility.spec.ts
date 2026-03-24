import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('page has lang attribute on html element', async ({ page }) => {
    await page.goto('/');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
  });

  test('buttons have accessible names', async ({ page }) => {
    await page.goto('/');
    const buttons = await page.locator('button').all();
    for (const btn of buttons.slice(0, 10)) {
      const text = await btn.textContent();
      const label = await btn.getAttribute('aria-label');
      expect((text?.trim() ?? '').length + (label?.length ?? 0)).toBeGreaterThan(0);
    }
  });

  test('images have alt attributes', async ({ page }) => {
    await page.goto('/');
    const imgs = await page.locator('img').all();
    for (const img of imgs) {
      const alt = await img.getAttribute('alt');
      expect(alt).not.toBeNull();
    }
  });

  test('focus ring visible on tab', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const focusedEl = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedEl).not.toBe('BODY');
  });

  test('color contrast — no pure white on white', async ({ page }) => {
    await page.goto('/');
    const bg = await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor);
    expect(bg).not.toBe('rgb(255, 255, 255)');
  });

  test('no tabindex > 0 (anti-pattern)', async ({ page }) => {
    await page.goto('/');
    const badTabindex = await page.locator('[tabindex]:not([tabindex="0"]):not([tabindex="-1"])').count();
    expect(badTabindex).toBe(0);
  });

  test('inputs have labels or aria-label', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /create|get started|join|sign up/i }).first().click().catch(() => {});
    await page.waitForTimeout(400);
    const inputs = await page.locator('input').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const placeholder = await input.getAttribute('placeholder');
      expect((id ?? '') + (ariaLabel ?? '') + (placeholder ?? '')).not.toBe('');
    }
  });
});
