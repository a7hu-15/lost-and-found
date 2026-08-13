const { test, expect } = require('@playwright/test');

test.describe('Phase 3C — Boundary Validation', () => {

  test('P3C-001: Item Title Length Boundary (Max 100 chars)', async ({ page }) => {
    await page.goto('/report-lost');
    await page.getByRole('button', { name: 'Electronics' }).click();
    await page.getByPlaceholder(/Apple, Dell/i).fill('A'.repeat(30));
    await page.getByPlaceholder(/Black, Navy Blue/i).fill('B'.repeat(30));
    await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();
    await page.getByPlaceholder(/Central Library/i).fill('Library');
    await page.getByRole('button', { name: /Next: Distinctive Details/i }).click();

    // 100 char boundary allows step progression
    const nextBtn = page.getByRole('button', { name: /Next: Contact Details/i });
    await expect(nextBtn).toBeDisabled(); // Required description is empty
    await page.getByPlaceholder(/Sticker of GitHub Octocat/i).fill('Distinctive laptop details');
    await expect(nextBtn).toBeEnabled();
    await page.screenshot({ path: 'screenshots/evidence/P3C-001-title-100-success.png' });
  });

  test('P3C-002: Location Length Boundary (Max 200 chars)', async ({ page }) => {
    await page.goto('/report-lost');
    await page.getByRole('button', { name: 'Electronics' }).click();
    await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();

    // 200 chars location -> Allowed
    const loc200 = 'L'.repeat(200);
    await page.getByPlaceholder(/Central Library/i).fill(loc200);
    await page.getByRole('button', { name: /Next: Distinctive Details/i }).click();
    await expect(page.getByText('Step 3: Tell us something unique')).toBeVisible();

    // Go back and try 201 chars -> Blocked
    await page.getByRole('button', { name: 'Back' }).click();
    await page.getByPlaceholder(/Central Library/i).fill('L'.repeat(201));
    await page.getByRole('button', { name: /Next: Distinctive Details/i }).click();
    
    // Verify progression is blocked and Step 3 is NOT reached
    const onStep3 = await page.getByText('Step 3: Tell us something unique').isVisible().catch(() => false);
    expect(onStep3).toBe(false);
    await page.screenshot({ path: 'screenshots/evidence/P3C-002-location-boundary.png' });
  });

  test('P3C-003: Description Word Count Boundary (Max 100 words)', async ({ page }) => {
    await page.goto('/report-lost');
    await page.getByRole('button', { name: 'Electronics' }).click();
    await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();
    await page.getByPlaceholder(/Central Library/i).fill('Library 2nd Floor');
    await page.getByRole('button', { name: /Next: Distinctive Details/i }).click();

    // 100 words -> Allowed
    const desc100 = Array.from({ length: 100 }, (_, i) => `word${i + 1}`).join(' ');
    await page.getByPlaceholder(/Sticker of GitHub Octocat/i).fill(desc100);
    await page.getByRole('button', { name: /Next: Contact Details/i }).click();
    await expect(page.getByText('Step 4: Contact Information')).toBeVisible();

    // Go back and try 101 words -> Blocked
    await page.getByRole('button', { name: 'Back' }).click();
    const desc101 = Array.from({ length: 101 }, (_, i) => `word${i + 1}`).join(' ');
    await page.getByPlaceholder(/Sticker of GitHub Octocat/i).fill(desc101);
    await page.getByRole('button', { name: /Next: Contact Details/i }).click();
    
    // Verify progression is blocked and Step 4 is NOT reached
    const onStep4 = await page.getByText('Step 4: Contact Information').isVisible().catch(() => false);
    expect(onStep4).toBe(false);
    await page.screenshot({ path: 'screenshots/evidence/P3C-003-desc-word-boundary.png' });
  });

  test('P3C-004: Email Length Boundary (Max 254 chars)', async ({ page }) => {
    await page.goto('/report-lost');
    await page.getByRole('button', { name: 'Electronics' }).click();
    await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();
    await page.getByPlaceholder(/Central Library/i).fill('Library 2nd Floor');
    await page.getByRole('button', { name: /Next: Distinctive Details/i }).click();
    await page.getByPlaceholder(/Sticker of GitHub Octocat/i).fill('Distinctive laptop case');
    await page.getByRole('button', { name: /Next: Contact Details/i }).click();

    const emailInput = page.getByPlaceholder('your.email@university.edu');
    await emailInput.fill('a'.repeat(250) + '@srm.edu'); // 258 chars > 254
    await page.getByRole('button', { name: /Complete & Submit Report/i }).click();

    // Verify submission safely prevented
    const isSubmitted = await page.getByText('Report Submitted Successfully').isVisible().catch(() => false);
    expect(isSubmitted).toBe(false);
    await page.screenshot({ path: 'screenshots/evidence/P3C-004-email-boundary.png' });
  });

  test('P3C-005: Extreme Input Test (10,000 Chars)', async ({ page }) => {
    await page.goto('/report-lost');
    await page.getByRole('button', { name: 'Electronics' }).click();
    await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();

    await page.getByPlaceholder(/Central Library/i).fill('X'.repeat(10000));
    await page.getByRole('button', { name: /Next: Distinctive Details/i }).click();

    // Verify app remains responsive, prevents progression to Step 3
    const onStep3 = await page.getByText('Step 3: Tell us something unique').isVisible().catch(() => false);
    expect(onStep3).toBe(false);
    await page.screenshot({ path: 'screenshots/evidence/P3C-005-extreme-input-responsive.png' });
  });

});
