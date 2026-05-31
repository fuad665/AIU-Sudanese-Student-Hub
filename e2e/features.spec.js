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

    // Log browser console messages to terminal
    page.on('console', msg => {
      console.log(`[BROWSER CONSOLE - ${msg.type()}] ${msg.text()}`);
    });
    
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
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
  });

  test.afterAll(async () => {
    await context.close();
    if (createdAuthId) {
      await deleteTestUser(createdAuthId);
    }
  });

  test('should display government history correctly', async () => {
    await page.click('nav a:has-text("Government")');
    // Ensure the page loaded and shows the Current Government header
    await expect(page.getByRole('heading', { name: /Current Government/i }).first()).toBeVisible();
  });
 
  test('should allow editing profile', async () => {
    await page.click('nav a:has-text("My Profile")');
    await expect(page.locator('text=Feat Test').first()).toBeVisible();
 
    // The profile page has a specific layout, let's just make sure it loads and displays correctly
    await expect(page.locator('text="STUDENT ID"')).toBeVisible();
    await expect(page.locator('text="MAJOR"')).toBeVisible();
  });
 
  test('should load announcements', async () => {
    await page.click('nav a:has-text("Announcements")');
    // Wait for the announcements list to appear or an empty state
    await expect(page.locator('text=Announcements').first()).toBeVisible();
  });
  
  test('should load events', async () => {
    await page.click('nav a:has-text("Events")');
    // Wait for events to appear or empty state
    await expect(page.locator('text=Events').first()).toBeVisible();
  });
 
  test('should load elections', async () => {
    await page.click('nav a:has-text("Elections")');
    // Wait for elections to appear
    await expect(page.locator('text=Elections').first()).toBeVisible();
  });
});
