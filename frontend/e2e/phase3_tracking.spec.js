const { test, expect } = require('@playwright/test');

test.describe('Phase 3 — Report Tracking & Session Reload', () => {

  test('P3T-001: Legitimate Lost Report Creation & Tokenless Tracking', async ({ page }) => {
    await page.goto('/report-lost');
    await page.getByRole('button', { name: 'Wallet' }).click();
    await page.getByPlaceholder(/Apple, Dell/i).fill('Fossil V4');
    await page.getByPlaceholder(/Black, Navy Blue/i).fill('Brown');
    await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();

    await page.getByPlaceholder(/Central Library/i).fill('Central Library 2nd Floor QA Desk V4');
    await page.getByRole('button', { name: /Next: Distinctive Details/i }).click();

    await page.getByPlaceholder(/Sticker of GitHub Octocat/i).fill('Brown leather Fossil wallet containing QA Student ID V4');
    await page.getByRole('button', { name: /Next: Contact Details/i }).click();

    await page.getByPlaceholder('your.email@university.edu').fill('qa.v4.lost@srm.edu');
    await page.getByPlaceholder(/9876543210/i).fill('9876543210');

    await page.getByRole('button', { name: /Complete & Submit Report/i }).click();
    await expect(page.getByText('Report Submitted Successfully')).toBeVisible({ timeout: 15000 });

    // Extract dynamic Report ID cleanly from DOM
    const bodyText = await page.locator('body').innerText();
    const match = bodyText.match(/LF-SRM-26-[A-Z0-9]+/);
    expect(match).not.toBeNull();
    const reportId = match[0];
    expect(reportId).toMatch(/^LF-SRM-26-[A-Z0-9]+$/);

    await page.screenshot({ path: 'screenshots/evidence/P3T-001-lost-submitted.png' });

    // Navigate to Track Report
    await page.goto('/track');
    const trackInput = page.locator('input[placeholder*="LF-SRM-26"]').first();
    await trackInput.fill(reportId);
    
    // Submit track with empty token
    const submitBtn = page.getByRole('button', { name: /Check Report Status/i });
    await submitBtn.click();

    // Verify report card renders with matching Report ID and title
    await expect(page.getByText(reportId)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: /Fossil V4/i })).toBeVisible();

    // Hard reload check via query string URL
    await page.goto(`/track?report_id=${reportId}`);
    await expect(page.getByText(reportId)).toBeVisible();
    await page.screenshot({ path: 'screenshots/evidence/P3T-001-reload-track-persists.png' });
  });

});
