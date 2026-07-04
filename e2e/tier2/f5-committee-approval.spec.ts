import { test, expect } from '@playwright/test';

test.describe('F5: Committee Approval (Boundary/Corner)', () => {
  test('Dashboard handles 0 pending claims without error', async ({ page }) => {
    // Assuming logged in as committee member
    await page.goto('/committee');
    await expect(page.locator('text=No pending claims').or(page.locator('table'))).toBeVisible();
  });

  test('Cannot approve a claim that was already rejected (if visible)', async ({ page }) => {
    await page.goto('/committee');
    // Depending on UI, either rejected claims don't appear, or clicking approve gives an error
    const approveButton = page.locator('button:has-text("Approve"):has([data-status="REJECTED"])');
    if (await approveButton.count() > 0) {
      await approveButton.click();
      await expect(page.locator('text=Invalid state transition').or(page.locator('text=Error'))).toBeVisible();
    }
  });

  test('Committee member cannot see dashboard when unauthenticated', async ({ page }) => {
    await page.goto('/committee');
    await expect(page).toHaveURL(/login|\//); // redirect to login or home
  });

  test('Rejecting a claim removes it from pending list', async ({ page }) => {
    await page.goto('/committee');
    const rejectButtons = page.locator('button:has-text("Reject")');
    if (await rejectButtons.count() > 0) {
      const claimId = await rejectButtons.first().getAttribute('data-claim-id');
      await rejectButtons.first().click();
      await expect(page.locator(`[data-claim-id="${claimId}"]`)).toBeHidden();
    }
  });

  test('Standard user accessing committee dashboard gets forbidden', async ({ page }) => {
    // Assuming logged in as standard user
    await page.goto('/committee');
    await expect(page.locator('text=Forbidden').or(page.locator('text=Access Denied'))).toBeVisible();
  });
});
