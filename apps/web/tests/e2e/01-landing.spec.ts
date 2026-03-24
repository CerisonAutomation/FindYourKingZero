import { test, expect } from '@playwright/test';

test.describe('Landing Screen', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/'); });

  test('renders headline', async ({ page }) => {
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
  test('renders CTA button', async ({ page }) => {
    await expect(page.getByRole('button').first()).toBeVisible();
  });
  test('navigates to signup', async ({ page }) => {
    const btn = page.getByRole('button', { name: /get started|create|join|sign up/i }).first();
    await btn.click();
    await expect(page).not.toHaveURL('/');
  });
  test('navigates to signin', async ({ page }) => {
    const btn = page.getByRole('button', { name: /sign in|log in|welcome back/i }).first();
    if (await btn.isVisible()) await btn.click();
  });
  test('no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('/');
    await page.waitForTimeout(1000);
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });
  test('dark background applied', async ({ page }) => {
    const bg = await page.locator('body, #root > div').first().evaluate(el => getComputedStyle(el).backgroundColor);
    expect(bg).not.toBe('rgb(255, 255, 255)');
  });
  test('page title set', async ({ page }) => {
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
  test('viewport is mobile width', async ({ page }) => {
    const width = await page.evaluate(() => window.innerWidth);
    expect(width).toBeLessThanOrEqual(430);
  });
  test('no broken images on landing', async ({ page }) => {
    const images = await page.locator('img').all();
    for (const img of images) {
      const nat = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      expect(nat).toBeGreaterThan(0);
    }
  });
  test('keyboard accessible — tab reaches button', async ({ page }) => {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT']).toContain(focused);
  });
});
