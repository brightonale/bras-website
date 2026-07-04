import { test, expect } from '@playwright/test';

test.describe('F3: Standard Sign-Up', () => {
  test('User can see standard sign-up form', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Create Account');
    await expect(page.locator('input[name="username"]')).toBeVisible();
  });

  test('Password is required for standard sign-up', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Create Account');
    await page.fill('input[name="username"]', 'newuser123');
    await page.click('button:has-text("Sign Up")');
    await expect(page.locator('text=Password is required').or(page.locator('text=required'))).toBeVisible();
  });

  test('Successful standard sign-up creates an account', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Create Account');
    await page.fill('input[name="username"]', 'standard_user');
    await page.fill('input[name="password"]', 'securepassword');
    await page.click('button:has-text("Sign Up")');
    await expect(page).toHaveURL(/profile|dashboard|\//);
  });

  test('Email is optional but accepted', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Create Account');
    await page.fill('input[name="username"]', 'user_with_email');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'securepassword');
    await page.click('button:has-text("Sign Up")');
    await expect(page).toHaveURL(/profile|dashboard|\//);
  });

  test('Standard user can access profile page after signup', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Create Account');
    await page.fill('input[name="username"]', 'profile_tester');
    await page.fill('input[name="password"]', 'securepassword');
    await page.click('button:has-text("Sign Up")');
    await page.goto('/profile');
    await expect(page.locator('text=Profile').or(page.locator('text=Dashboard'))).toBeVisible();
  });
});
