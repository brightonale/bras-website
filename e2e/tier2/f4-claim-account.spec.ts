import { test, expect } from '@playwright/test';

test.describe('F4: Claim Account (Boundary/Corner)', () => {
  test('Cannot submit claim without selecting an orphaned account', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Claim Legacy Account');
    // Assuming dropdown exists but nothing is selected
    await page.fill('input[name="password"]', 'universal123');
    await page.click('button:has-text("Submit Claim")');
    await expect(page.locator('text=select an account').or(page.locator('text=required'))).toBeVisible();
  });

  test('Fails when universal password has leading/trailing spaces', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Claim Legacy Account');
    await page.selectOption('select[name="legacyUserId"]', { index: 1 });
    await page.fill('input[name="password"]', ' universal123 ');
    await page.click('button:has-text("Submit Claim")');
    await expect(page.locator('text=Invalid password').or(page.locator('text=incorrect'))).toBeVisible();
  });

  test('Fails when trying to claim an already claimed account', async ({ page }) => {
    // Expected boundary case: Legacy account is no longer in the list or is disabled
    await page.goto('/login');
    await page.click('text=Claim Legacy Account');
    // We would assert the already claimed account does not appear in the dropdown.
    // For now we just check the page loads and we can verify dropdown items.
    const dropdown = page.locator('select[name="legacyUserId"]');
    await expect(dropdown).not.toContainText('already_claimed_user');
  });

  test('Claim form handles missing universal password gracefully', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Claim Legacy Account');
    await page.selectOption('select[name="legacyUserId"]', { index: 1 });
    await page.fill('input[name="password"]', '');
    await page.click('button:has-text("Submit Claim")');
    await expect(page.locator('text=Password is required').or(page.locator('text=required'))).toBeVisible();
  });

  test('Orphaned account list does not include non-legacy users', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Claim Legacy Account');
    const dropdown = page.locator('select[name="legacyUserId"]');
    await expect(dropdown).not.toContainText('standard_member_user');
  });
});
