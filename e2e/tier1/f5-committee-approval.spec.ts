import { test, expect } from '@playwright/test';

test.describe('F5: Committee Claim Approval', () => {
  test('Committee dashboard is protected', async ({ page }) => {
    await page.goto('/committee');
    await expect(page.locator('text=Access Denied').or(page.locator('text=Sign in'))).toBeVisible();
  });

  test('Pending claims list is visible to committee members', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'committee_user');
    await page.fill('input[name="password"]', 'committee_pass');
    await page.click('button:has-text("Sign In")');
    
    await page.goto('/committee');
    await expect(page.locator('text=Pending').or(page.locator('.claims-list'))).toBeVisible();
  });

  test('Committee can approve a claim', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'committee_user');
    await page.fill('input[name="password"]', 'committee_pass');
    await page.click('button:has-text("Sign In")');
    
    await page.goto('/committee');
    const approveBtn = page.locator('button:has-text("Approve")').first();
    await approveBtn.click();
    await expect(page.locator('text=approved').or(page.locator('.success-msg'))).toBeVisible();
  });

  test('Committee can reject a claim', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'committee_user');
    await page.fill('input[name="password"]', 'committee_pass');
    await page.click('button:has-text("Sign In")');
    
    await page.goto('/committee');
    const rejectBtn = page.locator('button:has-text("Reject")').first();
    await rejectBtn.click();
    await expect(page.locator('text=rejected').or(page.locator('.success-msg'))).toBeVisible();
  });

  test('Approved claims no longer appear in pending list', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'committee_user');
    await page.fill('input[name="password"]', 'committee_pass');
    await page.click('button:has-text("Sign In")');
    
    await page.goto('/committee');
    const claimCount = await page.locator('.pending-claim').count();
    if (claimCount > 0) {
      await page.click('button:has-text("Approve"):first-child');
      const newClaimCount = await page.locator('.pending-claim').count();
      expect(newClaimCount).toBeLessThan(claimCount);
    }
  });
});
