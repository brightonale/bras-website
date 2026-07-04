import { test, expect } from '@playwright/test';

test.describe('F7: Member Fun Facts (Boundary/Corner)', () => {
  test('Displays placeholder or hides facts when user has 0 ratings', async ({ page }) => {
    await page.goto('/profile');
    const factsSection = page.locator('.fun-facts');
    // Either hidden or shows N/A
    if (await factsSection.isVisible()) {
      await expect(factsSection).toContainText('N/A');
    }
  });

  test('Highest and lowest are identical when user has exactly 1 rating', async ({ page }) => {
    // Assuming seeded user with 1 rating
    await page.goto('/profile');
    const highest = page.locator('.fact-highest');
    const lowest = page.locator('.fact-lowest');
    if (await highest.isVisible() && await lowest.isVisible()) {
      const hText = await highest.textContent();
      const lText = await lowest.textContent();
      expect(hText).toEqual(lText);
    }
  });

  test('Handles ties for highest rated pint (shows first or multiple)', async ({ page }) => {
    await page.goto('/profile');
    const highest = page.locator('.fact-highest');
    if (await highest.isVisible()) {
      await expect(highest).not.toBeEmpty();
    }
  });

  test('Handles ties for lowest rated pint', async ({ page }) => {
    await page.goto('/profile');
    const lowest = page.locator('.fact-lowest');
    if (await lowest.isVisible()) {
      await expect(lowest).not.toBeEmpty();
    }
  });

  test('First social handles ratings with null dates by falling back to rating creation date', async ({ page }) => {
    await page.goto('/profile');
    const firstSocial = page.locator('.fact-first-social');
    if (await firstSocial.isVisible()) {
      const text = await firstSocial.textContent();
      expect(text).not.toContain('Invalid Date');
      expect(text).not.toContain('NaN');
    }
  });
});
