import { test, expect } from '@playwright/test';

test.describe('F7: Member Dashboard Fun Facts', () => {
  test('Fun facts section is rendered', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'member_user');
    await page.fill('input[name="password"]', 'member_pass');
    await page.click('button:has-text("Sign In")');
    await page.goto('/profile');
    await expect(page.locator('text=Fun Facts').or(page.locator('.fun-facts'))).toBeVisible();
  });

  test('Displays highest rated pint', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'member_user');
    await page.fill('input[name="password"]', 'member_pass');
    await page.click('button:has-text("Sign In")');
    await page.goto('/profile');
    await expect(page.locator('text=Highest Rated').or(page.locator('.highest-rated'))).toBeVisible();
  });

  test('Displays lowest rated pint', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'member_user');
    await page.fill('input[name="password"]', 'member_pass');
    await page.click('button:has-text("Sign In")');
    await page.goto('/profile');
    await expect(page.locator('text=Lowest Rated').or(page.locator('.lowest-rated'))).toBeVisible();
  });

  test('Displays first social date', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'member_user');
    await page.fill('input[name="password"]', 'member_pass');
    await page.click('button:has-text("Sign In")');
    await page.goto('/profile');
    await expect(page.locator('text=First Social').or(page.locator('.first-social'))).toBeVisible();
  });

  test('Handles no data gracefully', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'new_member');
    await page.fill('input[name="password"]', 'member_pass');
    await page.click('button:has-text("Sign In")');
    await page.goto('/profile');
    await expect(page.locator('text=Not enough data').or(page.locator('text=No ratings'))).toBeVisible();
  });
});
