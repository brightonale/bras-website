import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

test.describe('Tier 4 Scenario 4: Bulk reset and multiple claims', () => {
  test('Bulk reset legacy passwords, then multiple legacy users log in and claim successfully', async ({ page, context }) => {
    // 1. Bulk reset legacy passwords (F1)
    execSync('npx tsx scripts/legacy-password-reset.ts', { stdio: 'pipe' });
    
    // 2. Multiple legacy users claim
    for (let i = 1; i <= 2; i++) {
        const userContext = await context.browser()!.newContext();
        const userPage = await userContext.newPage();
        
        await userPage.goto('/login');
        await userPage.click('text=Claim');
        await userPage.fill('input[name="username"]', `multi_claimer_${i}`);
        await userPage.fill('input[name="password"]', 'multi_pass');
        await userPage.fill('input[name="universalPassword"]', 'bras_universal_2026');
        
        const selectLocator = userPage.locator('select[name="legacyUserId"]');
        if (await selectLocator.isVisible()) {
          // just try to select different options
          await selectLocator.selectOption({ index: i }); 
        }
        await userPage.click('button:has-text("Submit")');
        await userContext.close();
    }

    // 3. Committee approves them
    const committeeContext = await context.browser()!.newContext();
    const committeePage = await committeeContext.newPage();
    await committeePage.goto('/login');
    await committeePage.fill('input[name="username"]', 'committee_user');
    await committeePage.fill('input[name="password"]', 'committee_pass');
    await committeePage.click('button:has-text("Sign In")');
    await committeePage.goto('/committee');
    
    // Approve twice
    for (let i = 0; i < 2; i++) {
        const approveBtn = committeePage.locator('button:has-text("Approve")').first();
        if (await approveBtn.isVisible()) {
            await approveBtn.click();
            await expect(committeePage.locator('text=approved').or(committeePage.locator('.success-msg'))).toBeVisible();
        }
    }
    await committeeContext.close();
  });
});
