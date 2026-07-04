import { test, expect } from '@playwright/test';

test.describe('F4: Claim Account Sign-Up', () => {
  test('Claim option is visible on login/signup page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Claim').or(page.locator('text=existing account'))).toBeVisible();
  });

  test('Displays a list of orphaned legacy accounts', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Claim');
    await expect(page.locator('select[name="legacyUserId"]').or(page.locator('.legacy-users-list'))).toBeVisible();
  });

  test('Requires universal password to submit claim', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Claim');
    await page.fill('input[name="username"]', 'new_claimer');
    await page.fill('input[name="password"]', 'new_password');
    await page.click('button:has-text("Submit")');
    await expect(page.locator('text=Universal password is required').or(page.locator('text=required'))).toBeVisible();
  });

  test('Successful claim submission redirects and shows pending status', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Claim');
    await page.fill('input[name="username"]', 'new_claimer_2');
    await page.fill('input[name="password"]', 'new_password');
    await page.fill('input[name="universalPassword"]', 'bras_universal_2026');
    await page.click('button:has-text("Submit")');
    await expect(page.locator('text=pending').or(page.locator('text=Dashboard'))).toBeVisible();
  });

  test('Cannot submit a claim without selecting a legacy profile', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Claim');
    await page.fill('input[name="username"]', 'new_claimer_3');
    await page.fill('input[name="password"]', 'new_password');
    await page.fill('input[name="universalPassword"]', 'bras_universal_2026');
    await page.click('button:has-text("Submit")');
    await expect(page.locator('text=select a legacy profile').or(page.locator('text=required'))).toBeVisible();
  });
});
