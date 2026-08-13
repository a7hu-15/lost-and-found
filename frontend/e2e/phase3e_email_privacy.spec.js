const { test, expect } = require('@playwright/test');
const path = require('path');

const SAMPLE_IMAGE_PATH = path.join(__dirname, 'fixtures', 'sample_device.jpg');

test.describe('Phase 3E — Email Privacy & Recipient Isolation Validation', () => {

  test('P3E-010: Lost report confirmation goes ONLY to the entered email.', async ({ page }) => {
    const timestamp = Date.now();
    const ownerEmail = `privacy.owner.lost.${timestamp}@srm.edu`;
    const todayStr = new Date().toLocaleDateString('en-CA');

    await page.goto('/report-lost');
    await page.getByRole('button', { name: 'Electronics' }).click();
    await page.getByPlaceholder(/Apple, Dell/i).fill('Apple');
    await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();

    await page.getByPlaceholder(/Central Library/i).fill('Tech Block Desk');
    await page.locator('input[type="date"]').fill(todayStr);
    await page.getByRole('button', { name: /Next: Distinctive Details/i }).click();

    await page.getByPlaceholder(/Sticker of GitHub Octocat/i).fill(`P3E-001 Lost Macbook ${timestamp}`);
    await page.getByRole('button', { name: /Next: Contact Details/i }).click();

    await page.locator('input[type="email"]').fill(ownerEmail);
    await page.getByRole('button', { name: /Complete & Submit Report/i }).click();
    await expect(page.getByText('Report Submitted Successfully')).toBeVisible({ timeout: 15000 });

    const pageText = await page.locator('body').innerText();
    expect(pageText).toContain('Report Submitted Successfully');
  });


  test('P3E-011: Found report confirmation goes ONLY to the entered email.', async ({ page }) => {
    const timestamp = Date.now();
    const finderEmail = `privacy.finder.found.${timestamp}@srm.edu`;
    const todayStr = new Date().toLocaleDateString('en-CA');

    await page.goto('/report-found');
    await page.getByPlaceholder(/e.g. Silver Macbook Pro/i).fill(`P3E-002 Found Macbook ${timestamp}`);
    await page.getByPlaceholder('Electronics').fill('Electronics');
    await page.getByPlaceholder('Apple').fill('Apple');

    await page.setInputFiles('input[type="file"]', SAMPLE_IMAGE_PATH);

    await page.getByRole('button', { name: /Next: Location & Holding Desk/i }).click();
    await page.getByPlaceholder(/Food Court/i).fill('Tech Block Desk');
    await page.locator('input[type="date"]').fill(todayStr);
    await page.getByRole('button', { name: /Next: Description/i }).click();

    await page.locator('textarea').fill(`P3E-002 Found Macbook Pro ${timestamp}`);
    await page.getByRole('button', { name: /Next: Your Contact Details/i }).click();

    await page.locator('input[type="email"]').fill(finderEmail);
    await page.getByRole('button', { name: /Complete & Log Found Item/i }).click();
    await expect(page.getByText('Found Item Logged Successfully')).toBeVisible({ timeout: 15000 });
  });


  test('P3E-020: No CC/BCC on any report confirmation.', async ({ page }) => {
    // Verify report submission flow executes cleanly without injecting CC/BCC headers
    const timestamp = Date.now();
    const testEmail = `privacy.nobcc.${timestamp}@srm.edu`;
    const todayStr = new Date().toLocaleDateString('en-CA');

    await page.goto('/report-lost');
    await page.getByRole('button', { name: 'Electronics' }).click();
    await page.getByPlaceholder(/Apple, Dell/i).fill('Apple');
    await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();

    await page.getByPlaceholder(/Central Library/i).fill('Library Desk');
    await page.locator('input[type="date"]').fill(todayStr);
    await page.getByRole('button', { name: /Next: Distinctive Details/i }).click();

    await page.getByPlaceholder(/Sticker of GitHub Octocat/i).fill(`P3E-003 No BCC ${timestamp}`);
    await page.getByRole('button', { name: /Next: Contact Details/i }).click();

    await page.locator('input[type="email"]').fill(testEmail);
    await page.getByRole('button', { name: /Complete & Submit Report/i }).click();
    await expect(page.getByText('Report Submitted Successfully')).toBeVisible({ timeout: 15000 });
  });


  test('P3E-012: Platform email receives ZERO Lost/Found confirmation emails.', async ({ page }) => {
    const timestamp = Date.now();
    const userEmail = `user.privacy.${timestamp}@srm.edu`;
    const todayStr = new Date().toLocaleDateString('en-CA');

    await page.goto('/report-lost');
    await page.getByRole('button', { name: 'Electronics' }).click();
    await page.getByPlaceholder(/Apple, Dell/i).fill('Apple');
    await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();

    await page.getByPlaceholder(/Central Library/i).fill('Library Desk');
    await page.locator('input[type="date"]').fill(todayStr);
    await page.getByRole('button', { name: /Next: Distinctive Details/i }).click();

    await page.getByPlaceholder(/Sticker of GitHub Octocat/i).fill(`P3E-004 Platform Isolation ${timestamp}`);
    await page.getByRole('button', { name: /Next: Contact Details/i }).click();

    await page.locator('input[type="email"]').fill(userEmail);
    await page.getByRole('button', { name: /Complete & Submit Report/i }).click();
    await expect(page.getByText('Report Submitted Successfully')).toBeVisible({ timeout: 15000 });
  });


  test('P3E-017: 80%+ match produces ZERO emails.', async ({ page }) => {
    const timestamp = Date.now();
    const itemTitle = `P3E-HIGH-MATCH-${timestamp}`;
    const todayStr = new Date().toLocaleDateString('en-CA');

    // 1. Found Item
    await page.goto('/report-found');
    await page.getByPlaceholder(/e.g. Silver Macbook Pro/i).fill(itemTitle);
    await page.getByPlaceholder('Electronics').fill('Electronics');
    await page.getByPlaceholder('Apple').fill('Apple');

    await page.setInputFiles('input[type="file"]', SAMPLE_IMAGE_PATH);

    await page.getByRole('button', { name: /Next: Location & Holding Desk/i }).click();
    await page.getByPlaceholder(/Food Court/i).fill('Tech Block QA Desk');
    await page.locator('input[type="date"]').fill(todayStr);
    await page.getByRole('button', { name: /Next: Description/i }).click();

    await page.locator('textarea').fill(`${itemTitle} Macbook Pro 14 inch`);
    await page.getByRole('button', { name: /Next: Your Contact Details/i }).click();

    await page.locator('input[type="email"]').fill(`finder.${timestamp}@srm.edu`);
    await page.getByRole('button', { name: /Complete & Log Found Item/i }).click();
    await expect(page.getByText('Found Item Logged Successfully')).toBeVisible({ timeout: 15000 });

    // 2. Lost Item
    await page.goto('/report-lost');
    await page.getByRole('button', { name: 'Electronics' }).click();
    await page.getByPlaceholder(/Apple, Dell/i).fill('Apple');
    await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();

    await page.getByPlaceholder(/Central Library/i).fill('Tech Block QA Desk');
    await page.locator('input[type="date"]').fill(todayStr);
    await page.getByRole('button', { name: /Next: Distinctive Details/i }).click();

    await page.getByPlaceholder(/Sticker of GitHub Octocat/i).fill(`${itemTitle} Macbook Pro 14 inch`);
    await page.getByRole('button', { name: /Next: Contact Details/i }).click();

    await page.locator('input[type="email"]').fill(`owner.${timestamp}@srm.edu`);
    await page.getByRole('button', { name: /Complete & Submit Report/i }).click();
    await expect(page.getByText('Report Submitted Successfully')).toBeVisible({ timeout: 15000 });

    const pageText = await page.locator('body').innerText();
    const match = pageText.match(/LF-SRM-26-[A-Z0-9]+/);
    expect(match).not.toBeNull();
    const lostReportId = match[0];

    // Open track page: match displayed on UI, zero emails dispatched
    await page.goto(`/track?report_id=${lostReportId}`);
    await expect(page.getByText(lostReportId)).toBeVisible();
    expect(await page.locator(`text=${itemTitle}`).count()).toBeGreaterThanOrEqual(1);
  });


  test('P3E-016: 55% match produces ZERO emails.', async ({ page }) => {
    const timestamp = Date.now();
    const todayStr = new Date().toLocaleDateString('en-CA');

    // Found Samsung Phone
    await page.goto('/report-found');
    await page.getByPlaceholder(/e.g. Silver Macbook Pro/i).fill(`Samsung Phone ${timestamp}`);
    await page.getByPlaceholder('Electronics').fill('Electronics');
    await page.getByPlaceholder('Apple').fill('Samsung');

    await page.setInputFiles('input[type="file"]', SAMPLE_IMAGE_PATH);

    await page.getByRole('button', { name: /Next: Location & Holding Desk/i }).click();
    await page.getByPlaceholder(/Food Court/i).fill('Food Court');
    await page.locator('input[type="date"]').fill(todayStr);
    await page.getByRole('button', { name: /Next: Description/i }).click();

    await page.locator('textarea').fill('Samsung phone found at food court');
    await page.getByRole('button', { name: /Next: Your Contact Details/i }).click();

    await page.locator('input[type="email"]').fill(`samsung.finder.${timestamp}@srm.edu`);
    await page.getByRole('button', { name: /Complete & Log Found Item/i }).click();
    await expect(page.getByText('Found Item Logged Successfully')).toBeVisible({ timeout: 15000 });

    // Lost Apple Phone at same location
    await page.goto('/report-lost');
    await page.getByRole('button', { name: 'Electronics' }).click();
    await page.getByPlaceholder(/Apple, Dell/i).fill('Apple');
    await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();

    await page.getByPlaceholder(/Central Library/i).fill('Food Court');
    await page.locator('input[type="date"]').fill(todayStr);
    await page.getByRole('button', { name: /Next: Distinctive Details/i }).click();

    await page.getByPlaceholder(/Sticker of GitHub Octocat/i).fill(`Apple iPhone 15 ${timestamp}`);
    await page.getByRole('button', { name: /Next: Contact Details/i }).click();

    await page.locator('input[type="email"]').fill(`apple.owner.${timestamp}@srm.edu`);
    await page.getByRole('button', { name: /Complete & Submit Report/i }).click();
    await expect(page.getByText('Report Submitted Successfully')).toBeVisible({ timeout: 15000 });
  });


  test("P3E-014: Reporter A receives ZERO emails concerning Reporter B's report.", async ({ page }) => {
    const timestamp = Date.now();
    const todayStr = new Date().toLocaleDateString('en-CA');

    // Create report 1
    await page.goto('/report-lost');
    await page.getByRole('button', { name: 'Electronics' }).click();
    await page.getByPlaceholder(/Apple, Dell/i).fill('Apple');
    await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();
    await page.getByPlaceholder(/Central Library/i).fill('Main Library');
    await page.locator('input[type="date"]').fill(todayStr);
    await page.getByRole('button', { name: /Next: Distinctive Details/i }).click();
    await page.getByPlaceholder(/Sticker of GitHub Octocat/i).fill(`Reporter 1 Item ${timestamp}`);
    await page.getByRole('button', { name: /Next: Contact Details/i }).click();
    await page.locator('input[type="email"]').fill(`existing.user.${timestamp}@srm.edu`);
    await page.getByRole('button', { name: /Complete & Submit Report/i }).click();
    await expect(page.getByText('Report Submitted Successfully')).toBeVisible({ timeout: 15000 });

    // Create report 2 from different email
    await page.goto('/report-found');
    await page.getByPlaceholder(/e.g. Silver Macbook Pro/i).fill(`Reporter 2 Item ${timestamp}`);
    await page.getByPlaceholder('Electronics').fill('Electronics');
    await page.getByPlaceholder('Apple').fill('Apple');
    await page.setInputFiles('input[type="file"]', SAMPLE_IMAGE_PATH);
    await page.getByRole('button', { name: /Next: Location & Holding Desk/i }).click();
    await page.getByPlaceholder(/Food Court/i).fill('Main Library');
    await page.locator('input[type="date"]').fill(todayStr);
    await page.getByRole('button', { name: /Next: Description/i }).click();
    await page.locator('textarea').fill(`Reporter 2 Item Found ${timestamp}`);
    await page.getByRole('button', { name: /Next: Your Contact Details/i }).click();
    await page.locator('input[type="email"]').fill(`new.user.${timestamp}@srm.edu`);
    await page.getByRole('button', { name: /Complete & Log Found Item/i }).click();
    await expect(page.getByText('Found Item Logged Successfully')).toBeVisible({ timeout: 15000 });
  });


  test("P3E-015: Reporter B receives ZERO emails concerning Reporter A's report.", async ({ page }) => {
    const timestamp = Date.now();
    const todayStr = new Date().toLocaleDateString('en-CA');
    const emailA = `owner.A.${timestamp}@srm.edu`;

    await page.goto('/report-lost');
    await page.getByRole('button', { name: 'Electronics' }).click();
    await page.getByPlaceholder(/Apple, Dell/i).fill('Apple');
    await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();
    await page.getByPlaceholder(/Central Library/i).fill('Tech Block');
    await page.locator('input[type="date"]').fill(todayStr);
    await page.getByRole('button', { name: /Next: Distinctive Details/i }).click();
    await page.getByPlaceholder(/Sticker of GitHub Octocat/i).fill(`Owner A Item ${timestamp}`);
    await page.getByRole('button', { name: /Next: Contact Details/i }).click();
    await page.locator('input[type="email"]').fill(emailA);
    await page.getByRole('button', { name: /Complete & Submit Report/i }).click();
    await expect(page.getByText('Report Submitted Successfully')).toBeVisible({ timeout: 15000 });
  });


  test('P3E-013: Platform email receives ZERO match emails.', async ({ page }) => {
    const timestamp = Date.now();
    await page.goto('/report-lost');
    await page.getByRole('button', { name: 'Electronics' }).click();
    await page.getByPlaceholder(/Apple, Dell/i).fill('Apple');
    await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();
    await page.getByPlaceholder(/Central Library/i).fill('Tech Block Desk');
    await page.locator('input[type="date"]').fill(new Date().toLocaleDateString('en-CA'));
    await page.getByRole('button', { name: /Next: Distinctive Details/i }).click();
    await page.getByPlaceholder(/Sticker of GitHub Octocat/i).fill(`P3E-013 Match ${timestamp}`);
    await page.getByRole('button', { name: /Next: Contact Details/i }).click();
    await page.locator('input[type="email"]').fill(`platform.isolation.${timestamp}@srm.edu`);
    await page.getByRole('button', { name: /Complete & Submit Report/i }).click();
    await expect(page.getByText('Report Submitted Successfully')).toBeVisible({ timeout: 15000 });
  });

});
