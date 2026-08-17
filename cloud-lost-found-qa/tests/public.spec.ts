import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Public Website & Forms', () => {
  const dummyImage = path.join(__dirname, '../test-data/dummy.png');

  test('[U001] Homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=How can we help today?')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Report Lost Item' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Report Found Item' })).toBeVisible();
  });

  test('[U002] Lost report form opens', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Report Lost Item' }).click();
    await expect(page.locator('text=Step 1: What did you lose?')).toBeVisible();
  });

  test('[U003] Validation triggered on empty required fields', async ({ page }) => {
    await page.goto('/report-lost');
    await page.getByRole('button', { name: 'Next: Where & When Lost' }).click();
    await expect(page.locator('text=Step 2')).not.toBeVisible();
  });

  test('[U004] Submit valid Lost report (Happy Path)', async ({ page }) => {
    await page.goto('/report-lost');
    await page.getByPlaceholder('e.g. Blue Macbook Air').fill('Lost Laptop QA Test ' + Date.now());
    await page.getByPlaceholder('e.g. Apple, Dell, Titan').fill('Dell');
    await page.getByPlaceholder('e.g. Black, Navy Blue').fill('Silver');
    await page.setInputFiles('input[type="file"]', dummyImage);
    await page.getByRole('button', { name: 'Next: Where & When Lost' }).click();
    await page.getByPlaceholder('e.g. Central Library').fill('Main Campus Library');
    await page.locator('input[type="date"]').fill('2026-08-10');
    await page.getByRole('button', { name: 'Next: Distinctive Details' }).click();
    await page.getByPlaceholder('e.g. Sticker of GitHub').fill('It has a small scratch on the back');
    await page.getByRole('button', { name: 'Next: Contact Details' }).click();
    const uniqueSuffix = Date.now();
    await page.getByPlaceholder('your.email@university.edu').fill(`lost+${uniqueSuffix}@srm.edu`);
    await page.getByRole('button', { name: 'Complete & Submit Report' }).click();
    await expect(page.getByText('Report Submitted Successfully')).toBeVisible({ timeout: 15000 });
  });

  test('[U005] Boundary test - Location > 200 chars (Fails validation)', async ({ page }) => {
    await page.goto('/report-lost');
    await page.getByPlaceholder('e.g. Blue Macbook Air').fill('Lost Laptop QA Test');
    await page.setInputFiles('input[type="file"]', dummyImage);
    await page.getByRole('button', { name: 'Next: Where & When Lost' }).click();
    await page.getByPlaceholder('e.g. Central Library').fill('A'.repeat(201));
    await page.locator('input[type="date"]').fill('2026-08-10');
    await page.getByRole('button', { name: 'Next: Distinctive Details' }).click();
    await expect(page.getByText('Location must not exceed 200 characters.')).toBeVisible();
  });

  test('[U006] Boundary test - Future Date (Fails validation)', async ({ page }) => {
    await page.goto('/report-lost');
    await page.getByPlaceholder('e.g. Blue Macbook Air').fill('Lost Laptop QA Test');
    await page.setInputFiles('input[type="file"]', dummyImage);
    await page.getByRole('button', { name: 'Next: Where & When Lost' }).click();
    await page.getByPlaceholder('e.g. Central Library').fill('Library');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    await page.locator('input[type="date"]').fill(futureDate.toISOString().split('T')[0]);
    await page.getByRole('button', { name: 'Next: Distinctive Details' }).click();
    await expect(page.getByText('Date Lost cannot be in the future.')).toBeVisible();
  });

  test('[U007] Security - XSS injection attempt in description', async ({ page }) => {
    await page.goto('/report-lost');
    await page.getByPlaceholder('e.g. Blue Macbook Air').fill('Lost Laptop QA Test');
    await page.setInputFiles('input[type="file"]', dummyImage);
    await page.getByRole('button', { name: 'Next: Where & When Lost' }).click();
    await page.getByPlaceholder('e.g. Central Library').fill('Library');
    await page.locator('input[type="date"]').fill('2026-08-10');
    await page.getByRole('button', { name: 'Next: Distinctive Details' }).click();
    await page.getByPlaceholder('e.g. Sticker of GitHub').fill('<script>alert("XSS")</script>');
    await page.getByRole('button', { name: 'Next: Contact Details' }).click();
    const uniqueSuffix = Date.now();
    await page.getByPlaceholder('your.email@university.edu').fill(`lost+${uniqueSuffix}@srm.edu`);
    await page.getByRole('button', { name: 'Complete & Submit Report' }).click();
    await expect(page.getByText('Report Submitted Successfully')).toBeVisible({ timeout: 15000 });
  });

  test('[U008] Submit Found report without image (Fails validation)', async ({ page }) => {
    await page.goto('/report-found');
    await page.getByPlaceholder('e.g. Silver Macbook Pro 14-inch').fill('Found Phone QA Test');
    await page.getByRole('button', { name: 'Next: Location & Holding Desk' }).click();
    await expect(page.getByText('Step 2')).not.toBeVisible();
  });

  test('[U009] Submit valid Found report (Happy Path)', async ({ page }) => {
    await page.goto('/report-found');
    await page.getByPlaceholder('e.g. Silver Macbook Pro 14-inch').fill('Found Phone QA Test ' + Date.now());
    await page.getByPlaceholder('Apple').fill('Apple');
    await page.getByPlaceholder('Silver').fill('Black');
    await page.setInputFiles('input[type="file"]', dummyImage);
    await page.getByRole('button', { name: 'Next: Location & Holding Desk' }).click();
    await page.getByPlaceholder('e.g. Food Court Table 14').fill('Cafeteria Table 4');
    await page.locator('input[type="date"]').fill('2026-08-10');
    await page.getByRole('button', { name: 'Next: Description & Marks' }).click();
    await page.getByPlaceholder('e.g. Found on table 14 after lunch rush').fill('It has a case');
    await page.getByRole('button', { name: 'Next: Your Contact Details' }).click();
    const uniqueSuffix = Date.now();
    await page.getByPlaceholder('your.email@university.edu').fill(`found+${uniqueSuffix}@srm.edu`);
    await page.getByRole('button', { name: 'Complete & Log Found Item' }).click();
    await expect(page.getByText('Found Item Logged Successfully')).toBeVisible({ timeout: 15000 });
  });

  test('[U010] Public report listing loads successfully', async ({ page }) => {
    await page.goto('/lost');
    await expect(page.locator('h1', { hasText: 'Lost Items Feed' })).toBeVisible();
  });

  test('[U011] Search filtering works', async ({ page }) => {
    await page.goto('/search');
    await page.getByPlaceholder('Search items...').fill('Laptop');
    await page.keyboard.press('Enter');
    await expect(page.locator('.grid')).toBeVisible();
  });

  test('[U012] Privacy - Reporter emails are strictly hidden', async ({ page }) => {
    await page.goto('/lost');
    // Ensure no @ symbol is visibly rendered within item cards to protect emails
    const pageContent = await page.content();
    // Use an assertion that's more resilient than just checking page content directly since there might be @ in paths.
    // Instead, verify no 'mailto' links or standard email strings are in the feed cards.
    const emailsVisible = await page.evaluate(() => {
      const cards = document.querySelectorAll('.saas-card');
      return Array.from(cards).some(card => /\S+@\S+\.\S+/.test(card.textContent || ''));
    });
    expect(emailsVisible).toBe(false);
  });
});
