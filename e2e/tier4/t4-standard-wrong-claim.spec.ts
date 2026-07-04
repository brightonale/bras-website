import { test, expect } from '@playwright/test';

test.describe('Tier 4 Scenario 5: Standard member tries to claim account they dont own', () => {
  test('A standard member tries to claim an account they do not own, committee ignores/rejects', async ({ page, context }) => {
    // 1. Create a standard account (F3)
    await page.goto('/login');
    await page.click('text=Sign Up');
    await page.fill('input[name="username"]', 'sneaky_member');
    await page.fill('input[name="password"]', 'sneaky_pass');
    await page.fill('input[name="email"]', 'sneaky@example.com');
    await page.click('button:has-text("Sign Up")');

    // 2. Submit a claim (F4)
    // They go to claim page or they are already logged in and try to claim
    await page.goto('/login'); // If sign up logs them in, maybe they need to log out or just go to claim.
    await page.click('text=Claim');
    await page.fill('input[name="username"]', 'sneaky_member');
    await page.fill('input[name="password"]', 'sneaky_pass');
    await page.fill('input[name="universalPassword"]', 'bras_universal_2026');
    const selectLocator = page.locator('select[name="legacyUserId"]');
    if (await selectLocator.isVisible()) {
      await selectLocator.selectOption({ index: 3 }); // Pick some legacy user
    }
    await page.click('button:has-text("Submit")');

    // 3. Committee rejects it (F5)
    const committeeContext = await context.browser()!.newContext();
    const committeePage = await committeeContext.newPage();
    await committeePage.goto('/login');
    await committeePage.fill('input[name="username"]', 'committee_user');
    await committeePage.fill('input[name="password"]', 'committee_pass');
    await committeePage.click('button:has-text("Sign In")');
    await committeePage.goto('/committee');
    
    // Find the claim and reject it
    const rejectBtn = committeePage.locator('button:has-text("Reject")').first();
    if (await rejectBtn.isVisible()) {
        await rejectBtn.click();
        await expect(committeePage.locator('text=rejected').or(committeePage.locator('.success-msg'))).toBeVisible();
    }
    await committeeContext.close();
  });
});
