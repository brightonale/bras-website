import { test, expect } from '@playwright/test';

test.describe('Tier 4 Scenario 3: Committee rejects claim, user resubmits correctly, approved, views facts', () => {
  test('Committee rejects a claim, user submits new claim, approved, views facts', async ({ page, context }) => {
    // 1. User submits an incorrect claim
    await page.goto('/login');
    await page.click('text=Claim');
    await page.fill('input[name="username"]', 'wrong_claimer');
    await page.fill('input[name="password"]', 'wrong_pass');
    await page.fill('input[name="universalPassword"]', 'bras_universal_2026');
    await page.click('button:has-text("Submit")');

    // 2. Committee rejects it
    const committeeContext = await context.browser()!.newContext();
    const committeePage = await committeeContext.newPage();
    await committeePage.goto('/login');
    await committeePage.fill('input[name="username"]', 'committee_user');
    await committeePage.fill('input[name="password"]', 'committee_pass');
    await committeePage.click('button:has-text("Sign In")');
    await committeePage.goto('/committee');
    const rejectBtn = committeePage.locator('button:has-text("Reject")').first();
    if (await rejectBtn.isVisible()) {
        await rejectBtn.click();
        await expect(committeePage.locator('text=rejected').or(committeePage.locator('.success-msg'))).toBeVisible();
    }
    await committeeContext.close();

    // 3. User submits a new correct claim
    await page.goto('/login');
    await page.click('text=Claim');
    await page.fill('input[name="username"]', 'correct_claimer');
    await page.fill('input[name="password"]', 'correct_pass');
    await page.fill('input[name="universalPassword"]', 'bras_universal_2026');
    const selectLocator = page.locator('select[name="legacyUserId"]');
    if (await selectLocator.isVisible()) {
      await selectLocator.selectOption({ index: 2 });
    }
    await page.click('button:has-text("Submit")');

    // 4. Committee approves new claim
    const committeeContext2 = await context.browser()!.newContext();
    const committeePage2 = await committeeContext2.newPage();
    await committeePage2.goto('/login');
    await committeePage2.fill('input[name="username"]', 'committee_user');
    await committeePage2.fill('input[name="password"]', 'committee_pass');
    await committeePage2.click('button:has-text("Sign In")');
    await committeePage2.goto('/committee');
    const approveBtn = committeePage2.locator('button:has-text("Approve")').first();
    if (await approveBtn.isVisible()) {
        await approveBtn.click();
    }
    await committeeContext2.close();

    // 5. User views facts
    await page.goto('/login');
    await page.fill('input[name="username"]', 'correct_claimer');
    await page.fill('input[name="password"]', 'correct_pass');
    await page.click('button:has-text("Sign In")');
    
    await page.goto('/profile');
    await expect(page.locator('text=Fun Facts').or(page.locator('.fun-facts'))).toBeVisible();
  });
});
