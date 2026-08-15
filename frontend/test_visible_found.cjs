const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  console.log("Launching visible browser...");
  // Launch visible browser and slow down operations by 500ms so the user can watch it
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  const testImage = path.resolve(__dirname, 'e2e', 'fixtures', 'test_item.jpg');

  console.log("Navigating to https://lost-and-found-a7hu-15s-projects.vercel.app...");
  await page.goto('https://lost-and-found-a7hu-15s-projects.vercel.app', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000); // Wait 1 second to let user see homepage

  console.log("Clicking 'Report Found Item'...");
  await page.getByRole('link', { name: 'Report Found Item' }).click().catch(() => page.goto('https://lost-and-found-a7hu-15s-projects.vercel.app/report-found'));

  await page.waitForLoadState('networkidle');
  console.log("Filling form step 1...");
  await page.getByPlaceholder('e.g. Silver Macbook Pro 14-inch').fill(`Visible Found Test ${Date.now()}`);
  await page.getByPlaceholder('Electronics').fill('Electronics');
  await page.getByPlaceholder('Apple').fill('Apple');
  await page.getByPlaceholder('Silver', { exact: true }).fill('Silver');
  
  console.log("Uploading image...");
  await page.setInputFiles('input[type="file"]', testImage);
  
  await page.getByRole('button', { name: 'Next: Location & Holding Desk' }).click();
  await page.waitForTimeout(1000);

  console.log("Filling form step 2...");
  await page.getByPlaceholder('e.g. Food Court Table 14').fill('Cafeteria Table 4');
  await page.locator('input[type="date"]').fill('2023-10-10');
  await page.getByRole('button', { name: 'Next: Description & Marks' }).click();
  await page.waitForTimeout(1000);

  console.log("Filling form step 3...");
  await page.getByPlaceholder('e.g. Found on table 14 after lunch rush').fill('Found a silver laptop on the table. Testing visible browser.');
  await page.getByRole('button', { name: 'Next: Your Contact Details' }).click();
  await page.waitForTimeout(1000);

  console.log("Filling form step 4...");
  await page.getByPlaceholder('your.email@university.edu').fill(`found-deploy-${Date.now()}@srm.edu`);
  
  console.log("Submitting form...");
  await page.getByRole('button', { name: 'Complete & Log Found Item' }).click();

  console.log("Waiting for success response...");
  try {
    await page.waitForSelector('text="Found Item Logged Successfully"', { timeout: 15000 });
    console.log("SUCCESS! The form was successfully submitted on the deployed website.");
    await page.waitForTimeout(3000); // Leave it open for 3 seconds so the user can see the success message
  } catch (e) {
    console.error("FAILURE: The success message did not appear.");
    await page.screenshot({ path: 'visible_failure_found.png' });
    console.log("Saved screenshot to visible_failure_found.png");
  }

  await browser.close();
})();
