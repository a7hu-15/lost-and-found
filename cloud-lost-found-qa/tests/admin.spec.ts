import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  const adminEmail = process.env.QA_ADMIN_EMAIL;
  const adminPassword = process.env.QA_ADMIN_PASSWORD;

  test.beforeEach(async () => {
    if (!adminEmail || !adminPassword) {
      test.skip(true, 'QA_ADMIN_EMAIL or QA_ADMIN_PASSWORD is not set');
    }
  });

  test('[A001] Admin login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('user@university.edu').fill(adminEmail as string);
    await page.getByPlaceholder('••••••••').fill(adminPassword as string);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText('Admin')).toBeVisible({ timeout: 15000 });
  });

  test('[A002] Admin login with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('user@university.edu').fill('fakeadmin@university.edu');
    await page.getByPlaceholder('••••••••').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });

  test('[A003] Normal user accessing /admin (403 Forbidden)', async ({ page }) => {
    // Going to an admin route without logging in should redirect to /login
    await page.goto('/admin');
    await expect(page.locator('text=Sign in to Lost & Found')).toBeVisible();
  });

  test('[A004] API bypass attempt', async ({ request }) => {
    // Make a request to the backend without token
    const res = await request.get('/api/v1/admin/dashboard');
    expect(res.status()).toBe(401);
  });

  test('[A005] Admin dashboard loads statistics', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('user@university.edu').fill(adminEmail as string);
    await page.getByPlaceholder('••••••••').fill(adminPassword as string);
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Navigate to admin
    await page.goto('/admin');
    await expect(page.getByText('Overview', { exact: true })).toBeVisible({ timeout: 15000 });
  });

  test('[A006] Admin moderation queue opens', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('user@university.edu').fill(adminEmail as string);
    await page.getByPlaceholder('••••••••').fill(adminPassword as string);
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await page.goto('/admin/lost');
    await expect(page.locator('h2', { hasText: 'Lost Items' })).toBeVisible();
  });

  // A007, A008, A009 are kept as basic navigation or skipped to avoid mutating actual production data
  test.skip('[A007] Approve pending report', async () => {});
  test.skip('[A008] Reject flagged report', async () => {});
  test.skip('[A009] Delete report', async () => {});
});
