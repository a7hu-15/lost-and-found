const { test, expect } = require('@playwright/test');

test.describe('Phase 3B — Format Validation', () => {

  test('P3B-001: Email Format Validation', async ({ page }) => {
    await page.goto('/report-lost');
    await page.getByRole('button', { name: 'Electronics' }).click();
    await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();
    await page.getByPlaceholder(/Central Library/i).fill('Library 2nd Floor');
    await page.getByRole('button', { name: /Next: Distinctive Details/i }).click();
    await page.getByPlaceholder(/Sticker of GitHub Octocat/i).fill('Navy blue laptop case with serial number DL-94821');
    await page.getByRole('button', { name: /Next: Contact Details/i }).click();

    const emailInput = page.getByPlaceholder('your.email@university.edu');
    await emailInput.fill('abc');
    await page.getByRole('button', { name: /Complete & Submit Report/i }).click();

    // Native browser or HTML5 type="email" validation check
    const isValid = await emailInput.evaluate((el) => el.checkValidity()).catch(() => false);
    expect(isValid).toBe(false);
    await page.screenshot({ path: 'screenshots/evidence/P3B-001-invalid-email.png' });
  });

  test('P3B-002: Optional Phone Number - Empty Phone Allowed', async ({ page }) => {
    await page.goto('/report-lost');
    await page.getByRole('button', { name: 'Electronics' }).click();
    await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();
    await page.getByPlaceholder(/Central Library/i).fill('Library 2nd Floor');
    await page.getByRole('button', { name: /Next: Distinctive Details/i }).click();
    await page.getByPlaceholder(/Sticker of GitHub Octocat/i).fill('Navy blue laptop case with serial number DL-94821');
    await page.getByRole('button', { name: /Next: Contact Details/i }).click();

    await page.getByPlaceholder('your.email@university.edu').fill('qa.test.emptyphone@srm.edu');
    await page.getByPlaceholder(/9876543210/i).fill('');

    await page.getByRole('button', { name: /Complete & Submit Report/i }).click();
    await expect(page.getByText('Report Submitted Successfully')).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'screenshots/evidence/P3B-002-empty-phone-success.png' });
  });

  test('P3B-003: Valid Indian Mobile Formats Allowed', async ({ page }) => {
    const validPhones = ['9876543210', '6123456789', '+919876543210', '+91 9876543210'];
    for (const phone of validPhones) {
      await page.goto('/report-lost');
      await page.getByRole('button', { name: 'Electronics' }).click();
      await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();
      await page.getByPlaceholder(/Central Library/i).fill('Library 2nd Floor');
      await page.getByRole('button', { name: /Next: Distinctive Details/i }).click();
      await page.getByPlaceholder(/Sticker of GitHub Octocat/i).fill('Navy blue laptop case with serial number DL-94821');
      await page.getByRole('button', { name: /Next: Contact Details/i }).click();

      await page.getByPlaceholder('your.email@university.edu').fill(`qa.test.phone.${phone.replace(/\D/g, '')}@srm.edu`);
      await page.getByPlaceholder(/9876543210/i).fill(phone);

      await page.getByRole('button', { name: /Complete & Submit Report/i }).click();
      await expect(page.getByText('Report Submitted Successfully')).toBeVisible({ timeout: 15000 });
    }
  });

  test('P3B-004: Invalid Indian Mobile Formats Blocked', async ({ page }) => {
    const invalidPhones = ['123', '2345678901', '5123456789', '0123456789', '987654321', 'abcdefghij', '+911234567890'];
    for (const phone of invalidPhones) {
      await page.goto('/report-lost');
      await page.getByRole('button', { name: 'Electronics' }).click();
      await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();
      await page.getByPlaceholder(/Central Library/i).fill('Library 2nd Floor');
      await page.getByRole('button', { name: /Next: Distinctive Details/i }).click();
      await page.getByPlaceholder(/Sticker of GitHub Octocat/i).fill('Navy blue laptop case with serial number DL-94821');
      await page.getByRole('button', { name: /Next: Contact Details/i }).click();

      await page.getByPlaceholder('your.email@university.edu').fill('qa.test.invalidphone@srm.edu');
      await page.getByPlaceholder(/9876543210/i).fill(phone);

      await page.getByRole('button', { name: /Complete & Submit Report/i }).click();
      await expect(page.getByText(/Please enter a valid Indian mobile number/i)).toBeVisible();
    }
  });

  test('P3B-005: Date Lost - Future Date Blocked', async ({ page }) => {
    await page.goto('/report-lost');
    await page.getByRole('button', { name: 'Electronics' }).click();
    await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();
    await page.getByPlaceholder(/Central Library/i).fill('Library 2nd Floor');

    const dateInput = page.locator('input[type="date"]');
    await dateInput.fill('2026-12-31');
    await page.getByRole('button', { name: /Next: Distinctive Details/i }).click();

    await expect(page.getByText('Date Lost cannot be in the future.')).toBeVisible();
    await page.screenshot({ path: 'screenshots/evidence/P3B-005-future-date-blocked.png' });
  });

  test('P3B-006: Track Report - Invalid Report IDs Reject Safely', async ({ page }) => {
    await page.goto('/track');
    
    // Stable locator: input[placeholder*="LF-SRM-26"]
    const trackInput = page.locator('input[placeholder*="LF-SRM-26"]').first();
    await trackInput.fill('LF-INVALID-ID-999');
    
    const submitBtn = page.getByRole('button', { name: /Check Report Status/i });
    await submitBtn.click();

    await page.waitForTimeout(1000);
    
    // Verify safe rejection: NO false report card, RETURNED, or Invalid Date is displayed
    const hasFalseCard = await page.locator('text=ID: RETURNED').isVisible().catch(() => false);
    const hasInvalidDate = await page.locator('text=Invalid Date').isVisible().catch(() => false);

    expect(hasFalseCard).toBe(false);
    expect(hasInvalidDate).toBe(false);
    await page.screenshot({ path: 'screenshots/evidence/P3B-006-invalid-track-id.png' });
  });

});
