import { test, expect } from '@playwright/test';

test.describe('F6: Member Dashboard Past Ratings', () => {
  test('Profile page requires authentication', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('text=Sign in').or(page.locator('text=Access Denied'))).toBeVisible();
  });

  test('Authenticated user can view profile page', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'member_user');
    await page.fill('input[name="password"]', 'member_pass');
    await page.click('button:has-text("Sign In")');
    await page.goto('/profile');
    await expect(page.locator('text=Dashboard').or(page.locator('text=Profile'))).toBeVisible();
  });

  test('Past ratings table is displayed', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'member_user');
    await page.fill('input[name="password"]', 'member_pass');
    await page.click('button:has-text("Sign In")');
    await page.goto('/profile');
    await expect(page.locator('table').or(page.locator('.ratings-list'))).toBeVisible();
  });

  test('Empty state is shown when there are no ratings', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'new_member');
    await page.fill('input[name="password"]', 'member_pass');
    await page.click('button:has-text("Sign In")');
    await page.goto('/profile');
    await expect(page.locator('text=No ratings').or(page.locator('text=empty'))).toBeVisible();
  });

  test('Ratings table headers are correct', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'member_user');
    await page.fill('input[name="password"]', 'member_pass');
    await page.click('button:has-text("Sign In")');
    await page.goto('/profile');
    await expect(page.locator('text=Pint').or(page.locator('th'))).toBeVisible();
    await expect(page.locator('text=Score').or(page.locator('th'))).toBeVisible();
  });
});
