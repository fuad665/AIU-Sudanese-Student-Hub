import { test, expect } from '@playwright/test';
import { createTestUser, deleteTestUser } from './test-utils.js';

test.describe.serial('Authentication Flows', () => {
  const timestamp = Date.now();
  const testEmail = `testuser_${timestamp}@example.com`;
  const testPassword = 'Password123!';
  const testStudentId = timestamp.toString().slice(-7);
  let createdAuthId = null;

  test.beforeAll(async () => {
    // Create a real user for the login test via Admin API
    // This bypasses the sign up rate limits that the frontend UI hits
    const user = await createTestUser(testEmail, testPassword, 'Playwright Test User', testStudentId);
    createdAuthId = user.id;
  });

  test.afterAll(async () => {
    if (createdAuthId) {
      await deleteTestUser(createdAuthId);
    }
  });

  test('should register a new user successfully', async ({ page }) => {
    await page.goto('/register');
    
    // Fill out the registration form
    await page.fill('input[name="name"]', 'Playwright Test User');
    await page.fill('input[name="studentId"]', testStudentId);
    await page.fill('input[name="email"]', testEmail);
    await page.selectOption('select[name="major"]', 'Computer Science');
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    
    // Mock the signup API call to bypass Supabase rate limits for this UI test
    await page.route('**/auth/v1/signup*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 'mock-uuid', email: testEmail },
          session: null
        })
      });
    });

    await page.route('**/rest/v1/users*', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify([{ id: 1, auth_id: 'mock-uuid', name: 'Playwright Test User' }])
        });
      } else {
        await route.continue();
      }
    });

    // Submit
    await page.click('button[type="submit"]');

    // Should see success message or redirect
    await expect(page.locator('text=Registration Completed!')).toBeVisible({ timeout: 10000 });
  });

  test('should login with the newly created user', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="text"]', testEmail); // Email or student ID field
    await page.fill('input[type="password"]', testPassword);
    
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
    
    // Expect to see the user's name on the dashboard
    await expect(page.locator('text=Playwright Test User').first()).toBeVisible();
  });

  test('protected routes should redirect to login if unauthenticated', async ({ browser }) => {
    // Use an isolated context without the previous login state
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/dashboard');
    // It should bounce to login
    await expect(page).toHaveURL(/\/login$/);
  });
});
