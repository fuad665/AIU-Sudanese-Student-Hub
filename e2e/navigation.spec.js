import { test, expect } from '@playwright/test';
import { createTestUser, deleteTestUser } from './test-utils.js';

test.describe.serial('Navigation', () => {
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
    testEmail = `nav_${timestamp}@example.com`;
    testPassword = 'Password123!';
    testStudentId = timestamp.toString().slice(-7);
    const user = await createTestUser(testEmail, testPassword, 'Nav Test', testStudentId);
    createdAuthId = user.id;

    // Login with the created user
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

  const routes = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Directory', path: '/students' },
    { name: 'Government', path: '/government' },
    { name: 'Announcements', path: '/announcements' },
    { name: 'Events', path: '/events' },
    { name: 'Elections', path: '/elections' },
    { name: 'Alumni', path: '/alumni' }
  ];

  for (const route of routes) {
    test(`should navigate to ${route.name}`, async () => {
      // Click the sidebar link
      // Use role="link" and text for better accessibility querying
      await page.click(`nav a:has-text("${route.name}")`);
      await expect(page).toHaveURL(new RegExp(`${route.path}$`));
      
      // Ensure the page renders without crashing (no error boundaries shown)
      await expect(page.locator('text=Loading')).not.toBeVisible();
    });
  }
});
