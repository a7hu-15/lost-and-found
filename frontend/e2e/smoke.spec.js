const { test, expect } = require('@playwright/test');

const BASE_URL = ''; // Vite default port

// We want to fail the test if there are unhandled exceptions or console errors
// Note: sometimes there are harmless console warnings, so we specifically look for errors.

const routes = [
  { path: '/', name: 'Home' },
  { path: '/report-lost', name: 'Report Lost' },
  { path: '/report-found', name: 'Report Found' },
  { path: '/search', name: 'Search' },
  { path: '/track', name: 'Track Report' },
  { path: '/recover', name: 'Recover Report' },
  { path: '/how-it-works', name: 'How It Works' },
  { path: '/support', name: 'Support' },
  { path: '/login', name: 'Login' },
  { path: '/register', name: 'Register' }
];

test.describe('Phase 1: Public Website Smoke Test', () => {
  for (const route of routes) {
    test(`Should load ${route.name} page without breaking errors`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', exception => {
        errors.push(`Page error: ${exception}`);
      });
      page.on('console', msg => {
        if (msg.type() === 'error') {
          // Ignore Vite/React dev server noise if any, but catch real app errors
          const text = msg.text();
          if (!text.includes('Failed to load resource: the server responded with a status of 404') && 
              !text.includes('favicon.ico')) {
             errors.push(`Console error: ${text}`);
          }
        }
      });

      const response = await page.goto(`${BASE_URL}${route.path}`);
      
      // 1. Check HTTP Status
      // For SPAs, index.html might return 200, so we also check if the DOM renders
      expect(response.status()).toBe(200);

      // 2. Wait for rendering
      await page.waitForLoadState('networkidle');

      // 3. Check for white screen (body should have some text or significant children)
      const bodyText = await page.locator('body').innerText();
      expect(bodyText.trim().length).toBeGreaterThan(10);

      // 4. Ensure no critical console errors occurred during load
      // Using a soft assertion so we can see what errors happened
      expect.soft(errors).toHaveLength(0);

      // 5. Check for broken images — only check static UI assets (logo, icons)
      // Skip uploaded item thumbnails: they are ephemeral test-data and may not
      // persist across container restarts. The upload serving is verified separately.
      const images = await page.locator('img').all();
      for (const img of images) {
        const isVisible = await img.isVisible();
        if (isVisible) {
          const src = await img.getAttribute('src');
          // Skip: data URIs, empty src, upload thumbnails (test-data artifacts)
          if (!src || src.startsWith('data:') || src.startsWith('#')) continue;
          if (src.includes('/static/uploads/')) continue; // ephemeral test uploads
          const naturalWidth = await img.evaluate((node) => node.naturalWidth);
          expect.soft(naturalWidth, `Broken UI image detected: ${src}`).toBeGreaterThan(0);
        }
      }
    });
  }
});
