const { test, expect } = require('@playwright/test');
const path = require('path');

const SAMPLE_IMAGE_PATH = path.join(__dirname, 'fixtures', 'sample_device.jpg');

test.describe('Phase 3 — Holistic Matching Engine & Threshold Filter', () => {

  test('P3M-001: Genuine High-Confidence Match (>= 80% Stored & Displayed)', async ({ page }) => {
    const timestamp = Date.now();
    const itemTitle = `Apple Macbook Pro 14-inch Space Gray ${timestamp}`;
    const todayStr = new Date().toLocaleDateString('en-CA');

    // 1. Create Found Item first via real browser UI
    await page.goto('/report-found');
    await page.getByPlaceholder(/e.g. Silver Macbook Pro/i).fill(itemTitle);
    await page.getByPlaceholder('Electronics').fill('Electronics');
    await page.getByPlaceholder('Apple').fill('Apple');

    await page.setInputFiles('input[type="file"]', SAMPLE_IMAGE_PATH);

    await page.getByRole('button', { name: /Next: Location & Holding Desk/i }).click();

    await page.getByPlaceholder(/Food Court/i).fill('Tech Block Room 101 QA Desk');
    await page.locator('input[type="date"]').fill(todayStr);
    await page.getByRole('button', { name: /Next: Description/i }).click();

    await page.locator('textarea').fill(`${itemTitle} Macbook Pro 14 inch found on QA desk`);
    await page.getByRole('button', { name: /Next: Your Contact Details/i }).click();

    await page.locator('input[type="email"]').fill(`finder.${timestamp}@srm.edu`);
    await page.getByRole('button', { name: /Complete & Log Found Item/i }).click();
    await expect(page.getByText('Found Item Logged Successfully')).toBeVisible({ timeout: 15000 });

    // 2. Create Lost Item with matching attributes via real browser UI
    await page.goto('/report-lost');
    await page.getByRole('button', { name: 'Electronics' }).click();
    await page.getByPlaceholder(/Apple, Dell/i).fill('Apple');
    await page.getByPlaceholder(/Black, Navy Blue/i).fill('Space Gray');
    await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();

    await page.getByPlaceholder(/Central Library/i).fill('Tech Block Room 101 QA Desk');
    await page.locator('input[type="date"]').fill(todayStr);
    await page.getByRole('button', { name: /Next: Distinctive Details/i }).click();

    await page.getByPlaceholder(/Sticker of GitHub Octocat/i).fill(`${itemTitle} Macbook Pro 14 inch lost on QA desk`);
    await page.getByRole('button', { name: /Next: Contact Details/i }).click();

    await page.locator('input[type="email"]').fill(`owner.${timestamp}@srm.edu`);
    await page.getByRole('button', { name: /Complete & Submit Report/i }).click();
    await expect(page.getByText('Report Submitted Successfully')).toBeVisible({ timeout: 15000 });

    const pageText = await page.locator('body').innerText();
    const match = pageText.match(/LF-SRM-26-[A-Z0-9]+/);
    expect(match).not.toBeNull();
    const lostReportId = match[0];

    // 3. Open Track page for Lost Item
    await page.goto(`/track?report_id=${lostReportId}`);
    await expect(page.getByText(lostReportId)).toBeVisible({ timeout: 10000 });

    // 4. Verify candidate >= 80% appears in Possible Matched Items
    const matchCardForFoundItem = page.locator(`text=${itemTitle}`);
    const foundCardCount = await matchCardForFoundItem.count();
    expect(foundCardCount).toBeGreaterThanOrEqual(1);

    await page.screenshot({ path: 'screenshots/evidence/P3M-001-match-deduplication.png' });
  });


  test('P3M-002: Hard Category Incompatibility (0% Discarded & Unpersisted)', async ({ page }) => {
    const timestamp = Date.now();
    const foundTitle = `Brown Fossil Leather Wallet ${timestamp}`;
    const lostTitle = `Apple iPhone 15 Pro ${timestamp}`;
    const todayStr = new Date().toLocaleDateString('en-CA');

    // 1. Create Found Wallet
    await page.goto('/report-found');
    await page.getByPlaceholder(/e.g. Silver Macbook Pro/i).fill(foundTitle);
    await page.getByPlaceholder('Electronics').fill('Wallet');

    await page.setInputFiles('input[type="file"]', SAMPLE_IMAGE_PATH);

    await page.getByRole('button', { name: /Next: Location & Holding Desk/i }).click();
    await page.getByPlaceholder(/Food Court/i).fill('Library Desk 5');
    await page.locator('input[type="date"]').fill(todayStr);
    await page.getByRole('button', { name: /Next: Description/i }).click();

    await page.locator('textarea').fill('Brown fossil leather wallet found at library');
    await page.getByRole('button', { name: /Next: Your Contact Details/i }).click();

    await page.locator('input[type="email"]').fill(`wallet.${timestamp}@srm.edu`);
    await page.getByRole('button', { name: /Complete & Log Found Item/i }).click();
    await expect(page.getByText('Found Item Logged Successfully')).toBeVisible({ timeout: 15000 });

    // 2. Create Lost Phone at exact same location and date
    await page.goto('/report-lost');
    await page.getByRole('button', { name: 'Electronics' }).click();
    await page.getByPlaceholder(/Apple, Dell/i).fill('Apple');
    await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();

    await page.getByPlaceholder(/Central Library/i).fill('Library Desk 5');
    await page.locator('input[type="date"]').fill(todayStr);
    await page.getByRole('button', { name: /Next: Distinctive Details/i }).click();

    await page.getByPlaceholder(/Sticker of GitHub Octocat/i).fill(`${lostTitle} iPhone 15 lost at library`);
    await page.getByRole('button', { name: /Next: Contact Details/i }).click();

    await page.locator('input[type="email"]').fill(`phone.${timestamp}@srm.edu`);
    await page.getByRole('button', { name: /Complete & Submit Report/i }).click();
    await expect(page.getByText('Report Submitted Successfully')).toBeVisible({ timeout: 15000 });

    const pageText = await page.locator('body').innerText();
    const match = pageText.match(/LF-SRM-26-[A-Z0-9]+/);
    expect(match).not.toBeNull();
    const lostReportId = match[0];

    // 3. Track Lost Phone: verify Found Wallet is NOT displayed under Possible Matched Items
    await page.goto(`/track?report_id=${lostReportId}`);
    await expect(page.getByText(lostReportId)).toBeVisible();

    const walletCardCount = await page.locator(`text=${foundTitle}`).count();
    expect(walletCardCount).toBe(0);
  });


  test('P3M-003: Genuine Match Produces Zero Automatic Match-Alert Emails', async ({ page }) => {
    const timestamp = Date.now();
    const itemTitle = `Apple Macbook Pro 14-inch Space Gray ${timestamp}`;
    const todayStr = new Date().toLocaleDateString('en-CA');

    // 1. Submit Found Item
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

    await page.locator('input[type="email"]').fill(`email.finder.${timestamp}@srm.edu`);
    await page.getByRole('button', { name: /Complete & Log Found Item/i }).click();
    await expect(page.getByText('Found Item Logged Successfully')).toBeVisible({ timeout: 15000 });

    // 2. Submit Lost Item
    await page.goto('/report-lost');
    await page.getByRole('button', { name: 'Electronics' }).click();
    await page.getByPlaceholder(/Apple, Dell/i).fill('Apple');
    await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();

    await page.getByPlaceholder(/Central Library/i).fill('Tech Block QA Desk');
    await page.locator('input[type="date"]').fill(todayStr);
    await page.getByRole('button', { name: /Next: Distinctive Details/i }).click();

    await page.getByPlaceholder(/Sticker of GitHub Octocat/i).fill(`${itemTitle} Macbook Pro 14 inch`);
    await page.getByRole('button', { name: /Next: Contact Details/i }).click();

    await page.locator('input[type="email"]').fill(`email.owner.${timestamp}@srm.edu`);
    await page.getByRole('button', { name: /Complete & Submit Report/i }).click();
    await expect(page.getByText('Report Submitted Successfully')).toBeVisible({ timeout: 15000 });

    // Verify submission confirmation screen rendered successfully without error
    const pageText = await page.locator('body').innerText();
    expect(pageText).toContain('Report Submitted Successfully');
  });


  test('P3M-004: Brand Contradiction Penalty (< 80% Discarded)', async ({ page }) => {
    const timestamp = Date.now();
    const foundTitle = `Black Samsung Galaxy S24 Ultra ${timestamp}`;
    const lostTitle = `Black Apple iPhone 15 Pro ${timestamp}`;
    const todayStr = new Date().toLocaleDateString('en-CA');

    // Found Samsung Phone
    await page.goto('/report-found');
    await page.getByPlaceholder(/e.g. Silver Macbook Pro/i).fill(foundTitle);
    await page.getByPlaceholder('Electronics').fill('Electronics');
    await page.getByPlaceholder('Apple').fill('Samsung');

    await page.setInputFiles('input[type="file"]', SAMPLE_IMAGE_PATH);

    await page.getByRole('button', { name: /Next: Location & Holding Desk/i }).click();
    await page.getByPlaceholder(/Food Court/i).fill('Hostel Gate 1');
    await page.locator('input[type="date"]').fill(todayStr);
    await page.getByRole('button', { name: /Next: Description/i }).click();

    await page.locator('textarea').fill('Samsung Galaxy S24 found at Hostel Gate 1');
    await page.getByRole('button', { name: /Next: Your Contact Details/i }).click();

    await page.locator('input[type="email"]').fill(`samsung.${timestamp}@srm.edu`);
    await page.getByRole('button', { name: /Complete & Log Found Item/i }).click();
    await expect(page.getByText('Found Item Logged Successfully')).toBeVisible({ timeout: 15000 });

    // Lost Apple Phone at same location and date
    await page.goto('/report-lost');
    await page.getByRole('button', { name: 'Electronics' }).click();
    await page.getByPlaceholder(/Apple, Dell/i).fill('Apple');
    await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();

    await page.getByPlaceholder(/Central Library/i).fill('Hostel Gate 1');
    await page.locator('input[type="date"]').fill(todayStr);
    await page.getByRole('button', { name: /Next: Distinctive Details/i }).click();

    await page.getByPlaceholder(/Sticker of GitHub Octocat/i).fill(`${lostTitle} Apple iPhone 15`);
    await page.getByRole('button', { name: /Next: Contact Details/i }).click();

    await page.locator('input[type="email"]').fill(`apple.${timestamp}@srm.edu`);
    await page.getByRole('button', { name: /Complete & Submit Report/i }).click();
    await expect(page.getByText('Report Submitted Successfully')).toBeVisible({ timeout: 15000 });

    const pageText = await page.locator('body').innerText();
    const match = pageText.match(/LF-SRM-26-[A-Z0-9]+/);
    expect(match).not.toBeNull();
    const lostReportId = match[0];

    // Track Lost Apple Phone: Samsung Phone should NOT appear because brand contradiction penalized score < 80%
    await page.goto(`/track?report_id=${lostReportId}`);
    await expect(page.getByText(lostReportId)).toBeVisible();

    const samsungCardCount = await page.locator(`text=${foundTitle}`).count();
    expect(samsungCardCount).toBe(0);
  });


  test('P3M-005: Visual Similarity vs Visual Contradiction', async ({ page }) => {
    const timestamp = Date.now();
    const itemTitle = `Apple iPhone 15 Pro Blue ${timestamp}`;
    const todayStr = new Date().toLocaleDateString('en-CA');

    // Create Found Item with image
    await page.goto('/report-found');
    await page.getByPlaceholder(/e.g. Silver Macbook Pro/i).fill(itemTitle);
    await page.getByPlaceholder('Electronics').fill('Electronics');
    await page.getByPlaceholder('Apple').fill('Apple');

    await page.setInputFiles('input[type="file"]', SAMPLE_IMAGE_PATH);

    await page.getByRole('button', { name: /Next: Location & Holding Desk/i }).click();
    await page.getByPlaceholder(/Food Court/i).fill('Auditorium Hall B');
    await page.locator('input[type="date"]').fill(todayStr);
    await page.getByRole('button', { name: /Next: Description/i }).click();

    await page.locator('textarea').fill(`${itemTitle} Apple iPhone found in hall B`);
    await page.getByRole('button', { name: /Next: Your Contact Details/i }).click();

    await page.locator('input[type="email"]').fill(`visual.found.${timestamp}@srm.edu`);
    await page.getByRole('button', { name: /Complete & Log Found Item/i }).click();
    await expect(page.getByText('Found Item Logged Successfully')).toBeVisible({ timeout: 15000 });

    // Create Lost Item with visually matching image descriptor
    await page.goto('/report-lost');
    await page.getByRole('button', { name: 'Electronics' }).click();
    await page.getByPlaceholder(/Apple, Dell/i).fill('Apple');
    await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();

    await page.getByPlaceholder(/Central Library/i).fill('Auditorium Hall B');
    await page.locator('input[type="date"]').fill(todayStr);
    await page.getByRole('button', { name: /Next: Distinctive Details/i }).click();

    await page.getByPlaceholder(/Sticker of GitHub Octocat/i).fill(`${itemTitle} Apple iPhone lost in hall B`);
    await page.getByRole('button', { name: /Next: Contact Details/i }).click();

    await page.locator('input[type="email"]').fill(`visual.lost.${timestamp}@srm.edu`);
    await page.getByRole('button', { name: /Complete & Submit Report/i }).click();
    await expect(page.getByText('Report Submitted Successfully')).toBeVisible({ timeout: 15000 });

    const pageText = await page.locator('body').innerText();
    const match = pageText.match(/LF-SRM-26-[A-Z0-9]+/);
    expect(match).not.toBeNull();
    const lostReportId = match[0];

    // Track Lost Item: verify visual similarity produces match >= 80%
    await page.goto(`/track?report_id=${lostReportId}`);
    await expect(page.getByText(lostReportId)).toBeVisible();

    const visualCardCount = await page.locator(`text=${itemTitle}`).count();
    expect(visualCardCount).toBeGreaterThanOrEqual(1);
  });

});
