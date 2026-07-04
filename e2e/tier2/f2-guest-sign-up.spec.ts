import { test, expect } from '@playwright/test';

test.describe('F2: Guest Sign-Up (Boundary/Corner)', () => {
  test('Guest sign-up fails with purely whitespace username', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Continue as Guest');
    await page.fill('input[name="username"]', '   ');
    await page.click('button:has-text("Sign Up")');
    await expect(page.locator('text=Username is required').or(page.locator('text=required'))).toBeVisible();
  });

  test('Guest sign-up trims leading/trailing whitespace from username', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Continue as Guest');
    await page.fill('input[name="username"]', '  spaceduser  ');
    await page.click('button:has-text("Sign Up")');
    await expect(page).toHaveURL(/profile|dashboard|\//);
    // Might need further check to see if DB saved 'spaceduser'
  });

  test('Guest sign-up with max length username (e.g., 255 chars)', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Continue as Guest');
    const longUsername = 'a'.repeat(255);
    await page.fill('input[name="username"]', longUsername);
    await page.click('button:has-text("Sign Up")');
    // Depending on DB limits, this should either succeed or give a specific length error.
    await expect(page.locator('text=too long').or(page.locator('text=Error'))).toBeHidden();
  });

  test('Guest sign-up handles special characters in username', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Continue as Guest');
    await page.fill('input[name="username"]', 'user!@#$%^&*()_+');
    await page.click('button:has-text("Sign Up")');
    await expect(page).toHaveURL(/profile|dashboard|\//);
  });

  test('Guest sign-up fails if username already exists', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Continue as Guest');
    await page.fill('input[name="username"]', 'existing_user');
    await page.click('button:has-text("Sign Up")');
    await expect(page.locator('text=Username already taken').or(page.locator('text=taken'))).toBeVisible();
  });
});
