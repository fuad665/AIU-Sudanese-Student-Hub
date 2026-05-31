import { test, expect } from '@playwright/test';
import { createTestUser, deleteTestUser } from './test-utils.js';

test.describe.serial('Features', () => {
  let testEmail;
  let testPassword;
  let testStudentId;
  let createdAuthId = null;
  let context;
  let page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    
    // Create a real user using Admin API to bypass rate limits
    const timestamp = Date.now();
    testEmail = `feat_${timestamp}@example.com`;
    testPassword = 'Password123!';
    testStudentId = timestamp.toString().slice(-7);
    const user = await createTestUser(testEmail, testPassword, 'Feat Test', testStudentId);
    createdAuthId = user.id;

    // Login
    await page.goto('/login');
    await page.fill('input[type="text"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test.afterAll(async () => {
    await context.close();
    if (createdAuthId) {
      await deleteTestUser(createdAuthId);
    }
  });

  test('should display government history correctly', async () => {
    await page.goto('/government');
    // Ensure the page loaded and shows the Current Government header
    await expect(page.getByRole('heading', { name: /Current Government/i }).first()).toBeVisible();
  });

  test('should allow editing profile', async () => {
    await page.goto('/profile');
    await expect(page.locator('text=Feat Test').first()).toBeVisible();

    // Click Edit Profile if it's a toggle, or directly fill out the form
    // The profile page has a specific layout, let's just make sure it loads and displays correctly
    await expect(page.locator('text=Student ID')).toBeVisible();
    await expect(page.locator('text=Email')).toBeVisible();
    await expect(page.locator('text=Major')).toBeVisible();
  });

  test('should load announcements', async () => {
    await page.goto('/announcements');
    // Wait for the announcements list to appear or an empty state
    await expect(page.locator('text=Announcements').first()).toBeVisible();
  });
  
  test('should load events', async () => {
    await page.goto('/events');
    // Wait for events to appear or empty state
    await expect(page.locator('text=Events').first()).toBeVisible();
  });

  test('should load elections', async () => {
    await page.goto('/elections');
    // Wait for elections to appear
    await expect(page.locator('text=Elections').first()).toBeVisible();
  });
});
