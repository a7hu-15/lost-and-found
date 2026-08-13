const { test, expect } = require('@playwright/test');

test.describe('Phase 3D — Security Input Testing', () => {

  test('P3D-001: XSS String Input Safety', async ({ page }) => {
    let dialogTriggered = false;
    page.on('dialog', async (dialog) => {
      dialogTriggered = true;
      await dialog.dismiss();
    });

    await page.goto('/report-lost');
    await page.getByRole('button', { name: 'Electronics' }).click();
    await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();
    await page.getByPlaceholder(/Central Library/i).fill('<script>alert("xss")</script>');
    await page.getByRole('button', { name: /Next: Distinctive Details/i }).click();
    await page.getByPlaceholder(/Sticker of GitHub Octocat/i).fill('<img src=x onerror=alert(1)>');
    await page.getByRole('button', { name: /Next: Contact Details/i }).click();

    await page.getByPlaceholder('your.email@university.edu').fill('qa.security.xss@srm.edu');
    await page.getByRole('button', { name: /Complete & Submit Report/i }).click();

    await page.waitForTimeout(2000);

    // Verify 0 JavaScript dialog alert executed
    expect(dialogTriggered).toBe(false);
    await page.screenshot({ path: 'screenshots/evidence/P3D-001-xss-safety.png' });
  });

  test('P3D-002: SQL Injection String Input Safety', async ({ page }) => {
    let dialogTriggered = false;
    page.on('dialog', async (dialog) => {
      dialogTriggered = true;
      await dialog.dismiss();
    });

    await page.goto('/report-lost');
    await page.getByRole('button', { name: 'Electronics' }).click();
    await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();
    await page.getByPlaceholder(/Central Library/i).fill("' OR '1'='1");
    await page.getByRole('button', { name: /Next: Distinctive Details/i }).click();
    await page.getByPlaceholder(/Sticker of GitHub Octocat/i).fill('" UNION SELECT 1,2,3--');
    await page.getByRole('button', { name: /Next: Contact Details/i }).click();

    await page.getByPlaceholder('your.email@university.edu').fill('qa.security.sqli@srm.edu');
    await page.getByRole('button', { name: /Complete & Submit Report/i }).click();

    await page.waitForTimeout(2000);
    expect(dialogTriggered).toBe(false);

    await page.screenshot({ path: 'screenshots/evidence/P3D-002-sqli-safety.png' });
  });

});
