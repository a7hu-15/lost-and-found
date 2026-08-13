const { test, expect } = require('@playwright/test');

test.describe('Phase 3A — Required Field Validation', () => {

  test('P3A-001: Report Lost - Category Empty (Next Disabled)', async ({ page }) => {
    await page.goto('/report-lost');
    const nextBtn = page.getByRole('button', { name: /Next: Where & When Lost/i });
    await expect(nextBtn).toBeDisabled();
    await page.screenshot({ path: 'screenshots/evidence/P3A-001-category-empty.png' });
  });

  test('P3A-002: Report Lost - Location Empty (Next Disabled)', async ({ page }) => {
    await page.goto('/report-lost');
    await page.getByRole('button', { name: 'Electronics' }).click();
    await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();

    const nextBtn = page.getByRole('button', { name: /Next: Distinctive Details/i });
    await expect(nextBtn).toBeDisabled();
    await page.screenshot({ path: 'screenshots/evidence/P3A-002-location-empty.png' });
  });

  test('P3A-003: Report Lost - Description Empty (Next Disabled)', async ({ page }) => {
    await page.goto('/report-lost');
    await page.getByRole('button', { name: 'Electronics' }).click();
    await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();
    await page.getByPlaceholder(/Central Library/i).fill('Library 2nd Floor');
    await page.getByRole('button', { name: /Next: Distinctive Details/i }).click();

    const nextBtn = page.getByRole('button', { name: /Next: Contact Details/i });
    await expect(nextBtn).toBeDisabled();
    await page.screenshot({ path: 'screenshots/evidence/P3A-003-description-empty.png' });
  });

  test('P3A-004: Report Lost - Email Empty (Submit Disabled)', async ({ page }) => {
    await page.goto('/report-lost');
    await page.getByRole('button', { name: 'Electronics' }).click();
    await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();
    await page.getByPlaceholder(/Central Library/i).fill('Library 2nd Floor');
    await page.getByRole('button', { name: /Next: Distinctive Details/i }).click();
    await page.getByPlaceholder(/Sticker of GitHub Octocat/i).fill('Navy blue laptop case with serial number DL-94821');
    await page.getByRole('button', { name: /Next: Contact Details/i }).click();

    const submitBtn = page.getByRole('button', { name: /Complete & Submit Report/i });
    await expect(submitBtn).toBeDisabled();
    await page.screenshot({ path: 'screenshots/evidence/P3A-004-email-empty.png' });
  });

  test('P3A-005: Report Lost - Whitespace Location Blocked', async ({ page }) => {
    await page.goto('/report-lost');
    await page.getByRole('button', { name: 'Electronics' }).click();
    await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();

    await page.getByPlaceholder(/Central Library/i).fill('    ');
    const nextBtn = page.getByRole('button', { name: /Next: Distinctive Details/i });
    await expect(nextBtn).toBeDisabled();
    await page.screenshot({ path: 'screenshots/evidence/P3A-005-whitespace-location.png' });
  });

  test('P3A-006: Report Found - Title/Photo Empty (Next Disabled)', async ({ page }) => {
    await page.goto('/report-found');
    const nextBtn = page.getByRole('button', { name: /Next: Location & Holding Desk/i });
    await expect(nextBtn).toBeDisabled();
    await page.screenshot({ path: 'screenshots/evidence/P3A-006-found-title-empty.png' });
  });

  test('P3A-007: Report Found - Location Empty (Next Disabled)', async ({ page }) => {
    await page.goto('/report-found');
    const nextBtn = page.getByRole('button', { name: /Next: Location & Holding Desk/i });
    await expect(nextBtn).toBeDisabled();
  });

  test('P3A-008: Report Found - Description Empty (Next Disabled)', async ({ page }) => {
    await page.goto('/report-found');
    await expect(page.getByRole('button', { name: /Next: Location & Holding Desk/i })).toBeDisabled();
  });

  test('P3A-009: Report Found - Email Empty (Submit Disabled)', async ({ page }) => {
    await page.goto('/report-found');
    await expect(page.getByRole('button', { name: /Next: Location & Holding Desk/i })).toBeDisabled();
  });

});
