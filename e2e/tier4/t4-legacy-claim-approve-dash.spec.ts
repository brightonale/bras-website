import { test, expect } from '@playwright/test';

test.describe('Tier 4 Scenario 2: Legacy user claims account, approved, views dashboard', () => {
  test('A legacy user claims their account, a committee member approves it, and the user views their dashboard', async ({ page, context }) => {
    // 1. Legacy user claims account
    await page.goto('/login');
    await page.click('text=Claim');
    await page.fill('input[name="username"]', 'legacy_claimer');
    await page.fill('input[name="password"]', 'new_password');
    await page.fill('input[name="universalPassword"]', 'bras_universal_2026');
    // Assuming there's a select dropdown to choose legacy profile
    const selectLocator = page.locator('select[name="legacyUserId"]');
    if (await selectLocator.isVisible()) {
      await selectLocator.selectOption({ index: 1 });
    }
    await page.click('button:has-text("Submit")');
    await expect(page.locator('text=pending').or(page.locator('text=Dashboard'))).toBeVisible();

    // 2. Committee member approves it
    // Use a new context for committee member
    const committeeContext = await context.browser()!.newContext();
    const committeePage = await committeeContext.newPage();
    await committeePage.goto('/login');
    await committeePage.fill('input[name="username"]', 'committee_user');
    await committeePage.fill('input[name="password"]', 'committee_pass');
    await committeePage.click('button:has-text("Sign In")');
    await committeePage.goto('/committee');
    
    // Find the claim and approve it
    const approveBtn = committeePage.locator('button:has-text("Approve")').first();
    if (await approveBtn.isVisible()) {
        await approveBtn.click();
        await expect(committeePage.locator('text=approved').or(committeePage.locator('.success-msg'))).toBeVisible();
    }
    await committeeContext.close();

    // 3. Legacy user logs in and views their dashboard
    await page.goto('/login');
    await page.fill('input[name="username"]', 'legacy_claimer');
    await page.fill('input[name="password"]', 'new_password');
    await page.click('button:has-text("Sign In")');
    
    await page.goto('/profile');
    // F6: Past Ratings Table
    await expect(page.locator('text=Past Ratings').or(page.locator('.ratings-table'))).toBeVisible();
    // F7: Fun Facts
    await expect(page.locator('text=Fun Facts').or(page.locator('.fun-facts'))).toBeVisible();
  });
});
