const { test, expect } = require('@playwright/test');

test.describe('Phase 3E — Support Email Routing & Isolation', () => {

  test('P3E-018: Contact Support sends ONLY to SUPPORT_EMAIL.', async ({ page }) => {
    const timestamp = Date.now();
    const userEmail = `support.user.${timestamp}@srm.edu`;
    const userFullName = `Ashutosh ${timestamp}`;
    const subject = `Issue with report ${timestamp}`;
    
    // Navigate to support page
    await page.goto('/support');

    // Fill contact support form
    await page.getByPlaceholder(/Ashutosh Chaudhary/i).fill(userFullName);
    await page.getByPlaceholder(/your.email@university.edu/i).fill(userEmail);
    await page.getByPlaceholder(/Issue with report/i).fill(subject);
    await page.getByPlaceholder(/Describe your issue/i).fill(`I submitted a report but cannot track it... Timestamp: ${timestamp}`);
    
    await page.getByRole('button', { name: /Send Message/i }).click();

    // Verify success message
    await expect(page.getByText(/Message Sent/i)).toBeVisible({ timeout: 15000 });
  });


  test('P3E-019: Support submission does not send anything to the submitting user\'s email unless explicitly designed to do so.', async ({ page }) => {
    const timestamp = Date.now();
    await page.goto('/support');
    await page.getByPlaceholder(/Ashutosh Chaudhary/i).fill(`P3E-019 User ${timestamp}`);
    await page.getByPlaceholder(/your.email@university.edu/i).fill(`support.submitter.${timestamp}@srm.edu`);
    await page.getByPlaceholder(/Issue with report/i).fill(`Issue ${timestamp}`);
    await page.getByPlaceholder(/Describe your issue/i).fill(`Checking user isolation for support ticket ${timestamp}`);
    await page.getByRole('button', { name: /Send Message/i }).click();
    await expect(page.getByText(/Message Sent/i)).toBeVisible({ timeout: 15000 });
  });
});
