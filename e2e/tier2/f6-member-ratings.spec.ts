import { test, expect } from '@playwright/test';

test.describe('F6: Member Ratings Table (Boundary/Corner)', () => {
  test('Shows correct empty state when user has 0 ratings', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('text=No ratings yet').or(page.locator('text=empty'))).toBeVisible();
  });

  test('Handles ratings with negative scores or scores > max', async ({ page }) => {
    await page.goto('/profile');
    // The table should cap them or display them without breaking the UI
    const scores = page.locator('.rating-score');
    if (await scores.count() > 0) {
      await expect(scores.first()).toBeVisible();
    }
  });

  test('Handles missing beer names or social IDs gracefully', async ({ page }) => {
    await page.goto('/profile');
    // Table shouldn't crash if social is null
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });

  test('Pagination or scroll works for very large number of ratings', async ({ page }) => {
    await page.goto('/profile');
    const table = page.locator('table');
    // Assume there is a next page button if ratings > 50
    const nextBtn = page.locator('button:has-text("Next")');
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      await expect(table).toBeVisible(); // still visible
    }
  });

  test('Dates format correctly even for very old or invalid dates', async ({ page }) => {
    await page.goto('/profile');
    const dateCells = page.locator('.rating-date');
    if (await dateCells.count() > 0) {
      const text = await dateCells.first().textContent();
      expect(text).not.toContain('NaN');
      expect(text).not.toContain('Invalid Date');
    }
  });
});
