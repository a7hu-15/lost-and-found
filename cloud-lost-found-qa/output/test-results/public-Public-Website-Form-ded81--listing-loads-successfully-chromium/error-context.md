# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public.spec.ts >> Public Website & Forms >> [U010] Public report listing loads successfully
- Location: tests/public.spec.ts:109:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h1').filter({ hasText: 'Lost Items Feed' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('h1').filter({ hasText: 'Lost Items Feed' })

```

```yaml
- main:
  - paragraph:
    - strong: "404"
    - text: ": NOT_FOUND Code:"
    - code: "`NOT_FOUND`"
    - text: "ID:"
    - code: "`bom1::md4cs-1786961374025-543f77105d06`"
  - link "Read our documentation to learn more about this error.":
    - /url: https://vercel.com/docs/errors/NOT_FOUND
```

# Test source

```ts
  11  |     await expect(page.getByRole('link', { name: 'Report Found Item' })).toBeVisible();
  12  |   });
  13  | 
  14  |   test('[U002] Lost report form opens', async ({ page }) => {
  15  |     await page.goto('/');
  16  |     await page.getByRole('link', { name: 'Report Lost Item' }).click();
  17  |     await expect(page.locator('text=Step 1: What did you lose?')).toBeVisible();
  18  |   });
  19  | 
  20  |   test('[U003] Validation triggered on empty required fields', async ({ page }) => {
  21  |     await page.goto('/report-lost');
  22  |     await page.getByRole('button', { name: 'Next: Where & When Lost' }).click();
  23  |     await expect(page.locator('text=Step 2')).not.toBeVisible();
  24  |   });
  25  | 
  26  |   test('[U004] Submit valid Lost report (Happy Path)', async ({ page }) => {
  27  |     await page.goto('/report-lost');
  28  |     await page.getByPlaceholder('e.g. Blue Macbook Air').fill('Lost Laptop QA Test ' + Date.now());
  29  |     await page.getByPlaceholder('e.g. Apple, Dell, Titan').fill('Dell');
  30  |     await page.getByPlaceholder('e.g. Black, Navy Blue').fill('Silver');
  31  |     await page.setInputFiles('input[type="file"]', dummyImage);
  32  |     await page.getByRole('button', { name: 'Next: Where & When Lost' }).click();
  33  |     await page.getByPlaceholder('e.g. Central Library').fill('Main Campus Library');
  34  |     await page.locator('input[type="date"]').fill('2026-08-10');
  35  |     await page.getByRole('button', { name: 'Next: Distinctive Details' }).click();
  36  |     await page.getByPlaceholder('e.g. Sticker of GitHub').fill('It has a small scratch on the back');
  37  |     await page.getByRole('button', { name: 'Next: Contact Details' }).click();
  38  |     const uniqueSuffix = Date.now();
  39  |     await page.getByPlaceholder('your.email@university.edu').fill(`lost+${uniqueSuffix}@srm.edu`);
  40  |     await page.getByRole('button', { name: 'Complete & Submit Report' }).click();
  41  |     await expect(page.getByText('Report Submitted Successfully')).toBeVisible({ timeout: 15000 });
  42  |   });
  43  | 
  44  |   test('[U005] Boundary test - Location > 200 chars (Fails validation)', async ({ page }) => {
  45  |     await page.goto('/report-lost');
  46  |     await page.getByPlaceholder('e.g. Blue Macbook Air').fill('Lost Laptop QA Test');
  47  |     await page.setInputFiles('input[type="file"]', dummyImage);
  48  |     await page.getByRole('button', { name: 'Next: Where & When Lost' }).click();
  49  |     await page.getByPlaceholder('e.g. Central Library').fill('A'.repeat(201));
  50  |     await page.locator('input[type="date"]').fill('2026-08-10');
  51  |     await page.getByRole('button', { name: 'Next: Distinctive Details' }).click();
  52  |     await expect(page.getByText('Location must not exceed 200 characters.')).toBeVisible();
  53  |   });
  54  | 
  55  |   test('[U006] Boundary test - Future Date (Fails validation)', async ({ page }) => {
  56  |     await page.goto('/report-lost');
  57  |     await page.getByPlaceholder('e.g. Blue Macbook Air').fill('Lost Laptop QA Test');
  58  |     await page.setInputFiles('input[type="file"]', dummyImage);
  59  |     await page.getByRole('button', { name: 'Next: Where & When Lost' }).click();
  60  |     await page.getByPlaceholder('e.g. Central Library').fill('Library');
  61  |     const futureDate = new Date();
  62  |     futureDate.setDate(futureDate.getDate() + 5);
  63  |     await page.locator('input[type="date"]').fill(futureDate.toISOString().split('T')[0]);
  64  |     await page.getByRole('button', { name: 'Next: Distinctive Details' }).click();
  65  |     await expect(page.getByText('Date Lost cannot be in the future.')).toBeVisible();
  66  |   });
  67  | 
  68  |   test('[U007] Security - XSS injection attempt in description', async ({ page }) => {
  69  |     await page.goto('/report-lost');
  70  |     await page.getByPlaceholder('e.g. Blue Macbook Air').fill('Lost Laptop QA Test');
  71  |     await page.setInputFiles('input[type="file"]', dummyImage);
  72  |     await page.getByRole('button', { name: 'Next: Where & When Lost' }).click();
  73  |     await page.getByPlaceholder('e.g. Central Library').fill('Library');
  74  |     await page.locator('input[type="date"]').fill('2026-08-10');
  75  |     await page.getByRole('button', { name: 'Next: Distinctive Details' }).click();
  76  |     await page.getByPlaceholder('e.g. Sticker of GitHub').fill('<script>alert("XSS")</script>');
  77  |     await page.getByRole('button', { name: 'Next: Contact Details' }).click();
  78  |     const uniqueSuffix = Date.now();
  79  |     await page.getByPlaceholder('your.email@university.edu').fill(`lost+${uniqueSuffix}@srm.edu`);
  80  |     await page.getByRole('button', { name: 'Complete & Submit Report' }).click();
  81  |     await expect(page.getByText('Report Submitted Successfully')).toBeVisible({ timeout: 15000 });
  82  |   });
  83  | 
  84  |   test('[U008] Submit Found report without image (Fails validation)', async ({ page }) => {
  85  |     await page.goto('/report-found');
  86  |     await page.getByPlaceholder('e.g. Silver Macbook Pro 14-inch').fill('Found Phone QA Test');
  87  |     await page.getByRole('button', { name: 'Next: Location & Holding Desk' }).click();
  88  |     await expect(page.getByText('Step 2')).not.toBeVisible();
  89  |   });
  90  | 
  91  |   test('[U009] Submit valid Found report (Happy Path)', async ({ page }) => {
  92  |     await page.goto('/report-found');
  93  |     await page.getByPlaceholder('e.g. Silver Macbook Pro 14-inch').fill('Found Phone QA Test ' + Date.now());
  94  |     await page.getByPlaceholder('Apple').fill('Apple');
  95  |     await page.getByPlaceholder('Silver').fill('Black');
  96  |     await page.setInputFiles('input[type="file"]', dummyImage);
  97  |     await page.getByRole('button', { name: 'Next: Location & Holding Desk' }).click();
  98  |     await page.getByPlaceholder('e.g. Food Court Table 14').fill('Cafeteria Table 4');
  99  |     await page.locator('input[type="date"]').fill('2026-08-10');
  100 |     await page.getByRole('button', { name: 'Next: Description & Marks' }).click();
  101 |     await page.getByPlaceholder('e.g. Found on table 14 after lunch rush').fill('It has a case');
  102 |     await page.getByRole('button', { name: 'Next: Your Contact Details' }).click();
  103 |     const uniqueSuffix = Date.now();
  104 |     await page.getByPlaceholder('your.email@university.edu').fill(`found+${uniqueSuffix}@srm.edu`);
  105 |     await page.getByRole('button', { name: 'Complete & Log Found Item' }).click();
  106 |     await expect(page.getByText('Found Item Logged Successfully')).toBeVisible({ timeout: 15000 });
  107 |   });
  108 | 
  109 |   test('[U010] Public report listing loads successfully', async ({ page }) => {
  110 |     await page.goto('/lost');
> 111 |     await expect(page.locator('h1', { hasText: 'Lost Items Feed' })).toBeVisible();
      |                                                                      ^ Error: expect(locator).toBeVisible() failed
  112 |   });
  113 | 
  114 |   test('[U011] Search filtering works', async ({ page }) => {
  115 |     await page.goto('/search');
  116 |     await page.getByPlaceholder('Search items...').fill('Laptop');
  117 |     await page.keyboard.press('Enter');
  118 |     await expect(page.locator('.grid')).toBeVisible();
  119 |   });
  120 | 
  121 |   test('[U012] Privacy - Reporter emails are strictly hidden', async ({ page }) => {
  122 |     await page.goto('/lost');
  123 |     // Ensure no @ symbol is visibly rendered within item cards to protect emails
  124 |     const pageContent = await page.content();
  125 |     // Use an assertion that's more resilient than just checking page content directly since there might be @ in paths.
  126 |     // Instead, verify no 'mailto' links or standard email strings are in the feed cards.
  127 |     const emailsVisible = await page.evaluate(() => {
  128 |       const cards = document.querySelectorAll('.saas-card');
  129 |       return Array.from(cards).some(card => /\S+@\S+\.\S+/.test(card.textContent || ''));
  130 |     });
  131 |     expect(emailsVisible).toBe(false);
  132 |   });
  133 | });
  134 | 
```