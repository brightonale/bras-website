import { test, expect } from '@playwright/test';

test.describe('Tier 4 Scenario 1: Guest to Standard Account', () => {
  test('A user votes as a guest, then creates a standard account later', async ({ page }) => {
    // 1. Vote as a guest
    await page.goto('/login');
    await page.click('text=Continue as Guest');
    await page.goto('/vote');
    await expect(page.locator('button', { hasText: 'Submit Vote' })).toBeVisible();
    await page.click('button:has-text("Submit Vote")');
    
    // 2. Later, decide to create a standard account
    await page.goto('/login');
    await page.click('text=Sign Up'); // Assuming there's a standard sign up path
    await page.fill('input[name="username"]', 'new_standard_user');
    await page.fill('input[name="password"]', 'secure_password');
    await page.fill('input[name="email"]', 'standard@example.com');
    await page.click('button:has-text("Sign Up")');
    
    // 3. Verify standard account created (dashboard or profile access)
    await page.goto('/profile');
    await expect(page.locator('text=Access Denied')).not.toBeVisible();
    await expect(page.locator('text=Dashboard').or(page.locator('.profile-info'))).toBeVisible();
  });
});
