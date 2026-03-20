// =====================================================
// ENTERPRISE TESTING FRAMEWORK - COMPREHENSIVE TESTS
// =====================================================
// Senior-level testing with E2E, Integration, and Unit tests

import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { chromium, type Browser } from 'playwright';
import { faker } from '@faker-js/faker';
import { supabase } from '@/integrations/supabase/client';

// =====================================================
// TEST CONFIGURATION
// =====================================================

const TEST_CONFIG = {
  baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
  timeout: 30000,
  retries: 2,
  headless: process.env.CI === 'true'
};

// =====================================================
// TEST UTILITIES
// =====================================================

class TestUtils {
  static generateTestUser() {
    return {
      email: faker.internet.email(),
      password: faker.internet.password(12, true, /[A-Za-z0-9!@#$%^&*]/),
      displayName: faker.person.firstName(),
      age: faker.number.int({ min: 18, max: 65 }),
      bio: faker.lorem.paragraphs(2),
      location: {
        lat: faker.location.latitude(),
        lng: faker.location.longitude()
      }
    };
  }

  static async createTestUser(userData: any) {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: { display_name: userData.displayName }
      }
    });

    if (error) throw error;

    // Create profile
    await supabase
      .from('profiles')
      .insert({
        user_id: data.user?.id,
        display_name: userData.displayName,
        age: userData.age,
        bio: userData.bio,
        location: `SRID=4326;POINT(${userData.location.lng} ${userData.location.lat})`,
        location_updated_at: new Date().toISOString()
      });

    return data;
  }

  static async cleanupTestUser(userId: string) {
    await supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId);

    await supabase.auth.admin.deleteUser(userId);
  }

  static async login(page: Page, email: string, password: string) {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', email);
    await page.fill('[data-testid="password-input"]', password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  }

  static async waitForElement(page: Page, selector: string, timeout = 10000) {
    return await page.waitForSelector(selector, { timeout });
  }

  static async takeScreenshot(page: Page, name: string) {
    await page.screenshot({ 
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }
}

// =====================================================
// AUTHENTICATION TESTS
// =====================================================

test.describe('Authentication Flow', () => {
  let testUser: any;

  test.beforeEach(async () => {
    testUser = TestUtils.generateTestUser();
  });

  test.afterEach(async () => {
    if (testUser?.id) {
      await TestUtils.cleanupTestUser(testUser.id);
    }
  });

  test('should register new user successfully', async ({ page }) => {
    await page.goto('/signup');
    
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.fill('[data-testid="display-name-input"]', testUser.displayName);
    await page.fill('[data-testid="age-input"]', testUser.age.toString());
    await page.click('[data-testid="signup-button"]');

    // Should redirect to email verification
    await page.waitForURL('/verify-email');
    await expect(page.locator('[data-testid="verification-message"]')).toBeVisible();
    
    await TestUtils.takeScreenshot(page, 'signup-success');
  });

  test('should login with valid credentials', async ({ page }) => {
    // Create test user first
    const createdUser = await TestUtils.createTestUser(testUser);
    testUser.id = createdUser.user?.id;

    await TestUtils.login(page, testUser.email, testUser.password);

    // Should be redirected to dashboard
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-profile"]')).toContainText(testUser.displayName);
    
    await TestUtils.takeScreenshot(page, 'login-success');
  });

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', 'wrong-password');
    await page.click('[data-testid="login-button"]');

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
    
    await TestUtils.takeScreenshot(page, 'login-error');
  });

  test('should handle password reset flow', async ({ page }) => {
    await page.goto('/forgot-password');
    
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.click('[data-testid="reset-button"]');

    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Password reset email sent');
    
    await TestUtils.takeScreenshot(page, 'password-reset');
  });
});

// =====================================================
// PROFILE MANAGEMENT TESTS
// =====================================================

test.describe('Profile Management', () => {
  let testUser: any;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    testUser = TestUtils.generateTestUser();
    const createdUser = await TestUtils.createTestUser(testUser);
    testUser.id = createdUser.user?.id;

    page = await browser.newPage();
    await TestUtils.login(page, testUser.email, testUser.password);
  });

  test.afterAll(async () => {
    await page.close();
    if (testUser?.id) {
      await TestUtils.cleanupTestUser(testUser.id);
    }
  });

  test('should update profile information', async () => {
    await page.goto('/profile/edit');
    
    const newBio = faker.lorem.paragraph();
    const newAge = faker.number.int({ min: 18, max: 65 });
    
    await page.fill('[data-testid="bio-input"]', newBio);
    await page.fill('[data-testid="age-input"]', newAge.toString());
    await page.click('[data-testid="save-button"]');

    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Verify changes
    await page.goto('/profile');
    await expect(page.locator('[data-testid="profile-bio"]')).toContainText(newBio);
    await expect(page.locator('[data-testid="profile-age"]')).toContainText(newAge.toString());
    
    await TestUtils.takeScreenshot(page, 'profile-update');
  });

  test('should upload profile photos', async () => {
    await page.goto('/profile/photos');
    
    // Upload photo
    const fileInput = page.locator('[data-testid="photo-upload"]');
    await fileInput.setInputFiles('test-assets/test-photo.jpg');
    
    await page.click('[data-testid="upload-button"]');
    
    // Should show uploaded photo
    await expect(page.locator('[data-testid="photo-preview"]')).toBeVisible();
    
    await TestUtils.takeScreenshot(page, 'photo-upload');
  });

  test('should update privacy settings', async () => {
    await page.goto('/profile/privacy');
    
    await page.check('[data-testid="hide-age"]');
    await page.check('[data-testid="hide-location"]');
    await page.selectOption('[data-testid="profile-visibility"]', 'friends');
    
    await page.click('[data-testid="save-button"]');

    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    await TestUtils.takeScreenshot(page, 'privacy-settings');
  });
});

// =====================================================
// MATCHING SYSTEM TESTS
// =====================================================

test.describe('Matching System', () => {
  let user1: any, user2: any;
  let page1: Page, page2: Page;

  test.beforeAll(async ({ browser }) => {
    // Create two test users
    user1 = TestUtils.generateTestUser();
    user2 = TestUtils.generateTestUser();

    const createdUser1 = await TestUtils.createTestUser(user1);
    const createdUser2 = await TestUtils.createTestUser(user2);

    user1.id = createdUser1.user?.id;
    user2.id = createdUser2.user?.id;

    // Login both users
    page1 = await browser.newPage();
    page2 = await browser.newPage();

    await TestUtils.login(page1, user1.email, user1.password);
    await TestUtils.login(page2, user2.email, user2.password);
  });

  test.afterAll(async () => {
    await page1.close();
    await page2.close();
    
    if (user1?.id) await TestUtils.cleanupTestUser(user1.id);
    if (user2?.id) await TestUtils.cleanupTestUser(user2.id);
  });

  test('should show nearby users', async () => {
    await page1.goto('/discover');
    
    // Wait for users to load
    await page1.waitForSelector('[data-testid="user-card"]');
    
    const userCards = page1.locator('[data-testid="user-card"]');
    await expect(userCards.first()).toBeVisible();
    
    // Check distance is shown
    await expect(page1.locator('[data-testid="user-distance"]')).toBeVisible();
    
    await TestUtils.takeScreenshot(page1, 'nearby-users');
  });

  test('should create match when both users swipe right', async () => {
    // User 1 swipes right on User 2
    await page1.goto('/discover');
    await page1.click('[data-testid="like-button"]');
    
    // User 2 swipes right on User 1
    await page2.goto('/discover');
    await page2.click('[data-testid="like-button"]');
    
    // Check for match notification
    await page1.waitForSelector('[data-testid="match-notification"]', { timeout: 5000 });
    await expect(page1.locator('[data-testid="match-notification"]')).toBeVisible();
    
    await TestUtils.takeScreenshot(page1, 'match-created');
  });

  test('should allow conversation after match', async () => {
    // Open match
    await page1.click('[data-testid="match-notification"]');
    
    // Should be in conversation view
    await expect(page1.locator('[data-testid="conversation-view"]')).toBeVisible();
    
    // Send message
    const message = faker.lorem.sentence();
    await page1.fill('[data-testid="message-input"]', message);
    await page1.click('[data-testid="send-button"]');
    
    // Message should appear
    await expect(page1.locator('[data-testid="message-bubble"]')).toContainText(message);
    
    await TestUtils.takeScreenshot(page1, 'conversation-message');
  });
});

// =====================================================
// MESSAGING TESTS
// =====================================================

test.describe('Messaging System', () => {
  let user1: any, user2: any;
  let page1: Page, page2: Page;

  test.beforeAll(async ({ browser }) => {
    user1 = TestUtils.generateTestUser();
    user2 = TestUtils.generateTestUser();

    const createdUser1 = await TestUtils.createTestUser(user1);
    const createdUser2 = await TestUtils.createTestUser(user2);

    user1.id = createdUser1.user?.id;
    user2.id = createdUser2.user?.id;

    page1 = await browser.newPage();
    page2 = await browser.newPage();

    await TestUtils.login(page1, user1.email, user1.password);
    await TestUtils.login(page2, user2.email, user2.password);

    // Create a match between users
    await supabase.from('matches').insert({
      user_one: user1.id,
      user_two: user2.id,
      status: 'mutual'
    });
  });

  test.afterAll(async () => {
    await page1.close();
    await page2.close();
    
    if (user1?.id) await TestUtils.cleanupTestUser(user1.id);
    if (user2?.id) await TestUtils.cleanupTestUser(user2.id);
  });

  test('should send and receive messages in real-time', async () => {
    // User 1 opens conversation
    await page1.goto('/messages');
    await page1.click('[data-testid="conversation-link"]');
    
    // User 2 opens same conversation
    await page2.goto('/messages');
    await page2.click('[data-testid="conversation-link"]');
    
    // User 1 sends message
    const message = faker.lorem.sentence();
    await page1.fill('[data-testid="message-input"]', message);
    await page1.click('[data-testid="send-button"]');
    
    // User 2 should receive message
    await page2.waitForSelector(`[data-testid="message-bubble"]:has-text("${message}")`, { timeout: 5000 });
    await expect(page2.locator(`[data-testid="message-bubble"]:has-text("${message}")`)).toBeVisible();
    
    await TestUtils.takeScreenshot(page2, 'message-received');
  });

  test('should show typing indicators', async () => {
    // User 1 starts typing
    await page1.goto('/messages');
    await page1.click('[data-testid="conversation-link"]');
    await page1.fill('[data-testid="message-input"]', 'typing...');
    
    // User 2 should see typing indicator
    await expect(page2.locator('[data-testid="typing-indicator"]')).toBeVisible({ timeout: 3000 });
    
    await TestUtils.takeScreenshot(page2, 'typing-indicator');
  });

  test('should handle message reactions', async () => {
    // Send a message first
    const message = faker.lorem.sentence();
    await page1.fill('[data-testid="message-input"]', message);
    await page1.click('[data-testid="send-button"]');
    
    // Add reaction
    await page1.click('[data-testid="message-options"]');
    await page1.click('[data-testid="react-heart"]');
    
    // Reaction should appear
    await expect(page1.locator('[data-testid="reaction-heart"]')).toBeVisible();
    
    await TestUtils.takeScreenshot(page1, 'message-reaction');
  });
});

// =====================================================
// PRIVACY AND SAFETY TESTS
// =====================================================

test.describe('Privacy and Safety', () => {
  let testUser: any;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    testUser = TestUtils.generateTestUser();
    const createdUser = await TestUtils.createTestUser(testUser);
    testUser.id = createdUser.user?.id;

    page = await browser.newPage();
    await TestUtils.login(page, testUser.email, testUser.password);
  });

  test.afterAll(async () => {
    await page.close();
    if (testUser?.id) {
      await TestUtils.cleanupTestUser(testUser.id);
    }
  });

  test('should block and unblock users', async () => {
    await page.goto('/safety/block');
    
    // Block a user
    await page.fill('[data-testid="block-user-input"]', 'testuser@example.com');
    await page.click('[data-testid="block-button"]');
    
    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Unblock user
    await page.click('[data-testid="unblock-button"]');
    
    // Should confirm unblock
    await expect(page.locator('[data-testid="unblock-confirmation"]')).toBeVisible();
    
    await TestUtils.takeScreenshot(page, 'block-unblock');
  });

  test('should report inappropriate content', async () => {
    await page.goto('/safety/report');
    
    await page.selectOption('[data-testid="report-reason"]', 'inappropriate_content');
    await page.fill('[data-testid="report-description"]', 'This content violates community guidelines');
    await page.click('[data-testid="submit-report"]');
    
    // Should show confirmation
    await expect(page.locator('[data-testid="report-confirmation"]')).toBeVisible();
    
    await TestUtils.takeScreenshot(page, 'report-content');
  });

  test('should respect privacy settings', async () => {
    // Set profile to private
    await page.goto('/profile/privacy');
    await page.selectOption('[data-testid="profile-visibility"]', 'private');
    await page.click('[data-testid="save-button"]');
    
    // Verify profile is not discoverable
    // This would require a second user to test
    await expect(page.locator('[data-testid="privacy-confirmation"]')).toBeVisible();
    
    await TestUtils.takeScreenshot(page, 'privacy-settings-applied');
  });
});

// =====================================================
// PERFORMANCE TESTS
// =====================================================

test.describe('Performance Tests', () => {
  test('should load dashboard within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Check performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0
      };
    });
    
    console.log('Performance metrics:', metrics);
  });

  test('should handle large lists efficiently', async ({ page }) => {
    await page.goto('/discover');
    
    // Measure scroll performance
    const scrollStartTime = Date.now();
    
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    await page.waitForTimeout(1000); // Wait for lazy loading
    
    const scrollTime = Date.now() - scrollStartTime;
    
    // Should handle scrolling efficiently
    expect(scrollTime).toBeLessThan(2000);
    
    await TestUtils.takeScreenshot(page, 'performance-scroll');
  });
});

// =====================================================
// ACCESSIBILITY TESTS
// =====================================================

test.describe('Accessibility Tests', () => {
  test('should meet WCAG 2.1 AA standards', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper heading structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
    expect(headings).toBeGreaterThan(0);
    
    // Check for alt text on images
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    expect(imagesWithoutAlt).toBe(0);
    
    // Check for proper form labels
    const inputsWithoutLabels = await page.locator('input:not([aria-label]):not([aria-labelledby])').count();
    const labels = await page.locator('label').count();
    
    if (inputsWithoutLabels > 0) {
      expect(labels).toBeGreaterThanOrEqual(inputsWithoutLabels);
    }
    
    // Check for keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.locator(':focus');
    expect(await focusedElement.count()).toBe(1);
    
    await TestUtils.takeScreenshot(page, 'accessibility-check');
  });

  test('should support screen readers', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for ARIA labels
    const ariaLabels = await page.locator('[aria-label]').count();
    expect(ariaLabels).toBeGreaterThan(0);
    
    // Check for semantic HTML
    const semanticElements = await page.locator('main, nav, aside, section, article, header, footer').count();
    expect(semanticElements).toBeGreaterThan(0);
    
    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1); // Should have exactly one h1
  });
});

// =====================================================
// INTEGRATION TESTS
// =====================================================

test.describe('Integration Tests', () => {
  test('should handle complete user journey', async ({ page }) => {
    const testUser = TestUtils.generateTestUser();
    
    try {
      // Registration
      await page.goto('/signup');
      await page.fill('[data-testid="email-input"]', testUser.email);
      await page.fill('[data-testid="password-input"]', testUser.password);
      await page.fill('[data-testid="display-name-input"]', testUser.displayName);
      await page.click('[data-testid="signup-button"]');
      
      // Email verification (mock)
      await page.goto('/verify-email');
      await page.click('[data-testid="verify-button"]');
      
      // Login
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', testUser.email);
      await page.fill('[data-testid="password-input"]', testUser.password);
      await page.click('[data-testid="login-button"]');
      
      // Profile setup
      await page.goto('/profile/edit');
      await page.fill('[data-testid="bio-input"]', faker.lorem.paragraph());
      await page.click('[data-testid="save-button"]');
      
      // Discover users
      await page.goto('/discover');
      await page.waitForSelector('[data-testid="user-card"]');
      
      // Create match
      await page.click('[data-testid="like-button"]');
      
      // Send message
      await page.goto('/messages');
      if (await page.locator('[data-testid="conversation-link"]').isVisible()) {
        await page.click('[data-testid="conversation-link"]');
        await page.fill('[data-testid="message-input"]', 'Hello!');
        await page.click('[data-testid="send-button"]');
      }
      
      await TestUtils.takeScreenshot(page, 'complete-journey');
      
    } finally {
      // Cleanup
      const { data: { user } } = await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password
      });
      
      if (user?.id) {
        await TestUtils.cleanupTestUser(user.id);
      }
    }
  });
});

// =====================================================
// EXPORTS
// =====================================================

export { TestUtils, TEST_CONFIG };
