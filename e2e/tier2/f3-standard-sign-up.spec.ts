import { test, expect } from '@playwright/test';

test.describe('F3: Standard Sign-Up (Boundary/Corner)', () => {
  test('Fails with invalid email format', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Create Account');
    await page.fill('input[name="username"]', 'user1');
    await page.fill('input[name="email"]', 'notanemail');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button:has-text("Sign Up")');
    await expect(page.locator('text=Invalid email').or(page.locator('text=valid email'))).toBeVisible();
  });

  test('Fails with empty password but filled username', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Create Account');
    await page.fill('input[name="username"]', 'user2');
    await page.fill('input[name="password"]', '');
    await page.click('button:has-text("Sign Up")');
    await expect(page.locator('text=Password is required').or(page.locator('text=required'))).toBeVisible();
  });

  test('Fails with duplicate username regardless of case', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Create Account');
    await page.fill('input[name="username"]', 'USER2'); // Assuming user2 exists
    await page.fill('input[name="password"]', 'password123');
    await page.click('button:has-text("Sign Up")');
    await expect(page.locator('text=already taken').or(page.locator('text=exists'))).toBeVisible();
  });

  test('Handles extremely long passwords', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Create Account');
    await page.fill('input[name="username"]', 'user3');
    const longPassword = 'a'.repeat(255);
    await page.fill('input[name="password"]', longPassword);
    await page.click('button:has-text("Sign Up")');
    // Should either succeed or give max length error, not crash
    await expect(page.locator('text=Server Error')).toBeHidden();
  });

  test('Fails with whitespace-only password', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Create Account');
    await page.fill('input[name="username"]', 'user4');
    await page.fill('input[name="password"]', '    ');
    await page.click('button:has-text("Sign Up")');
    await expect(page.locator('text=Password cannot be just spaces').or(page.locator('text=invalid'))).toBeVisible();
  });
});
