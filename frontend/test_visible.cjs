const { chromium } = require('@playwright/test');

(async () => {
  console.log("Launching visible browser...");
  // Launch visible browser and slow down operations by 500ms so the user can watch it
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Navigating to https://lost-and-found-5h6siussi-a7hu-15s-projects.vercel.app...");
  await page.goto('https://lost-and-found-5h6siussi-a7hu-15s-projects.vercel.app', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000); // Wait 1 second to let user see homepage

  console.log("Clicking 'Report a Lost Item'...");
  await page.getByRole('link', { name: 'Report Lost Item' }).click().catch(() => page.goto('https://lost-and-found-5h6siussi-a7hu-15s-projects.vercel.app/report-lost'));

  await page.waitForLoadState('networkidle');
  console.log("Filling form step 1...");
  await page.getByRole('button', { name: 'Electronics' }).click();
  await page.getByPlaceholder('e.g. Apple, Dell, Titan').fill('Apple');
  await page.getByPlaceholder('e.g. Black, Navy Blue').fill('Silver');
  await page.getByRole('button', { name: 'Next: Where & When Lost' }).click();
  await page.waitForTimeout(1000);

  console.log("Filling form step 2...");
  await page.getByPlaceholder('e.g. Central Library').fill('Main Campus Library');
  await page.locator('input[type="date"]').fill('2023-10-10');
  await page.getByRole('button', { name: 'Next: Distinctive Details' }).click();
  await page.waitForTimeout(1000);

  console.log("Filling form step 3...");
  await page.getByPlaceholder('e.g. Sticker of GitHub').fill('Testing live deployment with visible browser ' + Date.now());
  await page.getByRole('button', { name: 'Next: Contact Details' }).click();
  await page.waitForTimeout(1000);

  console.log("Filling form step 4...");
  await page.getByPlaceholder('your.email@university.edu').fill(`test-deploy-${Date.now()}@srm.edu`);
  
  console.log("Submitting form...");
  await page.getByRole('button', { name: 'Complete & Submit Report' }).click();

  console.log("Waiting for success response...");
  try {
    await page.waitForSelector('text="Report Submitted Successfully"', { timeout: 15000 });
    console.log("SUCCESS! The form was successfully submitted on the deployed website.");
    await page.waitForTimeout(3000); // Leave it open for 3 seconds so the user can see the success message
  } catch (e) {
    console.error("FAILURE: The success message did not appear.");
    await page.screenshot({ path: 'visible_failure.png' });
    console.log("Saved screenshot to visible_failure.png");
  }

  await browser.close();
})();
