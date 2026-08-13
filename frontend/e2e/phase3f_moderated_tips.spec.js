const { test, expect } = require('@playwright/test');

test.describe('Phase 3f - Moderated Information Tips System', () => {
  let lostItemUuid;   // internal UUID — shown in admin tips queue
  let lostReportId;   // human-readable ID — shown in public search
  const timestamp = Date.now();
  const tipMessage = `I saw a MacBook matching this description near the coffee shop. [${timestamp}]`;

  test.beforeAll(async ({ request }) => {
    // 1. Create a lost item directly via API to test against
    const res = await request.post('/api/v1/lost/create', {
      multipart: {
        title: `MacBook Tip Test ${timestamp}`,
        category: 'Electronics',
        location: 'Library Area',
        lost_date: '2026-08-01',
        description: 'Testing the tips system',
        contact_email: `owner.tips.${timestamp}@srm.edu`
      }
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    lostItemUuid = body.id;        // UUID used in admin tips queue display
    lostReportId = body.report_id; // human-readable for public search
  });

  test('Public user can submit an information tip', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    
    // Find the item card — filter by 'View Details' to skip the search box container
    const itemCard = page.locator('.saas-card')
      .filter({ hasText: 'View Details' })
      .filter({ hasText: `MacBook Tip Test ${timestamp}` })
      .first();
    await expect(itemCard).toBeVisible({ timeout: 15000 });
    await itemCard.click();
    
    // The modal should open
    const infoButton = page.getByRole('button', { name: /I Have Information/i });
    await expect(infoButton).toBeVisible({ timeout: 10000 });
    await infoButton.click();
    
    // Fill out the form with a timestamp-unique message so we can find it in admin
    await page.getByPlaceholder('E.g., I saw an AirPods case near the library entrance...').fill(tipMessage);
    await page.getByPlaceholder('Your Name (Optional)').fill('Helpful Student');
    await page.getByPlaceholder('Your Email (Optional)').fill('helpful@srm.edu');
    
    await page.getByRole('button', { name: 'Submit Information' }).click();
    
    // Should see success message
    await expect(page.getByText('Information Submitted')).toBeVisible({ timeout: 10000 });
  });

  test('Staff admin can review and approve information tips', async ({ page }) => {
    // 1. Login as admin using correct credentials and flow
    await page.goto('/admin');
    await page.getByPlaceholder('Enter your authorized email address').fill('test@admin.edu');
    await page.getByPlaceholder('••••••••••••').fill('Password123!');
    await page.getByRole('button', { name: 'Access Staff Console' }).click();
    
    await expect(page.getByText('System Overview')).toBeVisible({ timeout: 10000 });

    // 2. Navigate to Lost Items page where the Information Tips Queue lives
    await page.click('text=Lost Items');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    
    // 3. Scroll down to the Information Tips Queue section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    // 4. Confirm the Tips Queue section is visible
    await expect(page.getByText('Information Tips Queue')).toBeVisible({ timeout: 15000 });
    
    // 5. Find our specific tip by the internal UUID (displayed as "Lost Item Report ID" in admin)
    //    and the unique timestamp-tagged message
    const tipCard = page.locator('.admin-card')
      .filter({ hasText: lostItemUuid })
      .first();
    await expect(tipCard).toBeVisible({ timeout: 10000 });
    
    // Verify it contains our timestamp-unique tip message
    await expect(tipCard.getByText(tipMessage)).toBeVisible({ timeout: 5000 });
    
    // 6. Approve the tip
    await tipCard.getByRole('button', { name: 'Approve & Notify Owner' }).click();
    
    // 7. Check success notification
    await expect(page.getByText('Information Tip Approved & Owner Notified')).toBeVisible({ timeout: 10000 });
    
    // 8. The tip card should disappear from the PENDING queue after approval
    await expect(tipCard).not.toBeVisible({ timeout: 5000 });
  });
});
