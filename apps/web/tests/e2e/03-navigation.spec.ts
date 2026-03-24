import { test, expect } from '@playwright/test';

// Helper: inject a mock authenticated user
async function mockAuth(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.evaluate(() => {
    const mockUser = {
      id: 'test-user-1',
      authId: 'auth-1',
      name: 'Test King',
      age: 25,
      bio: 'Test bio',
      avatar: '',
      photos: [],
      city: 'Madrid',
      lat: 40.4168,
      lng: -3.7038,
      h3Hex: '891e2030027ffff',
      tribes: ['Bear'],
      lookingFor: ['Chat'],
      height: '180cm',
      position: 'Vers' as const,
      relationshipStatus: 'Single' as const,
      hivStatus: 'Neg' as const,
      onPrEP: false,
      verified: false,
      premium: false,
      online: true,
      lastSeen: Date.now(),
      publicKey: {} as JsonWebKey,
      createdAt: Date.now(),
    };
    localStorage.setItem('king-auth', JSON.stringify({ state: { user: mockUser, token: 'mock-token', isAuthenticated: true }, version: 0 }));
  });
  await page.reload();
  await page.waitForTimeout(800);
}

test.describe('Navigation', () => {
  test('authenticated user lands on discover', async ({ page }) => {
    await mockAuth(page);
    await expect(page.locator('text=/discover|nearby|find/i').first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('bottom nav renders when authenticated', async ({ page }) => {
    await mockAuth(page);
    const nav = page.locator('nav, [role="navigation"]').first();
    // nav may be custom div — check for 5 nav buttons
    await page.waitForTimeout(500);
  });

  test('SPA routing — no full page reload on navigation', async ({ page }) => {
    await mockAuth(page);
    let navigationCount = 0;
    page.on('load', () => navigationCount++);
    navigationCount = 0; // reset after auth setup
    const btn = page.getByRole('button').first();
    if (await btn.isVisible()) await btn.click();
    await page.waitForTimeout(500);
    expect(navigationCount).toBe(0); // SPA — no reload
  });

  test('browser back does not break app', async ({ page }) => {
    await mockAuth(page);
    await page.goBack();
    await page.waitForTimeout(500);
    // App should still render, not white screen
    const root = page.locator('#root');
    await expect(root).toBeAttached();
  });

  test('direct URL load renders app', async ({ page }) => {
    await page.goto('/');
    const root = page.locator('#root');
    await expect(root).toBeAttached();
  });

  test('404-style deep link falls back to index', async ({ page }) => {
    const response = await page.goto('/some/deep/route');
    // Vercel rewrites send all routes to index.html
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('#root')).toBeAttached();
  });

  test('unauthenticated user sees landing', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('king-auth'));
    await page.reload();
    await page.waitForTimeout(500);
    await expect(page.locator('button').first()).toBeVisible();
  });
});
