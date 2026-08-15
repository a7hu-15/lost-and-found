const { chromium } = require('@playwright/test');

(async () => {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Navigating to https://lost-and-found-5h6siussi-a7hu-15s-projects.vercel.app...");
  await page.goto('https://lost-and-found-5h6siussi-a7hu-15s-projects.vercel.app', { waitUntil: 'networkidle' });

  console.log("Clicking 'Report a Lost Item'...");
  await page.getByRole('link', { name: 'Report Lost Item' }).click().catch(() => page.goto('https://lost-and-found-5h6siussi-a7hu-15s-projects.vercel.app/report-lost'));

  await page.waitForLoadState('networkidle');
  console.log("Filling form step 1...");
  await page.getByRole('button', { name: 'Electronics' }).click();
  await page.getByPlaceholder(/Apple, Dell/i).fill('Apple');
  await page.getByRole('button', { name: /Next: Where & When Lost/i }).click();

  console.log("Filling form step 2...");
  await page.getByPlaceholder(/Where did you lose it/i).fill('Library');
  await page.locator('input[type="date"]').fill('2023-10-10');
  await page.getByRole('button', { name: /Next: Extra Details/i }).click();

  console.log("Filling form step 3...");
  await page.getByPlaceholder(/Any unique marks/i).fill('Testing live deployment');
  await page.getByRole('button', { name: /Next: Your Contact Info/i }).click();

  console.log("Filling form step 4...");
  await page.locator('input[type="email"]').fill('test-deploy@example.com');
  
  console.log("Submitting form...");
  await page.getByRole('button', { name: /Complete & Log Lost Item/i }).click();

  console.log("Waiting for success response...");
  try {
    await page.waitForSelector('text="Lost Item Logged Successfully"', { timeout: 15000 });
    console.log("SUCCESS! The form was successfully submitted on the deployed website.");
  } catch (e) {
    console.error("FAILURE: The success message did not appear. The deployed website may still be broken.");
    await page.screenshot({ path: 'failure_screenshot.png' });
    console.log("Saved failure screenshot to failure_screenshot.png");
  }

  await browser.close();
})();
