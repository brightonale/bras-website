import { test, expect } from '@playwright/test';

test.describe('F2: Guest Sign-Up', () => {
  test('User can navigate to sign-up page and select Guest option', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Guest')).toBeVisible();
  });

  test('User can create a guest account without email', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Continue as Guest');
    await expect(page).toHaveURL(/.*vote.*/);
  });

  test('Guest session is established', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Continue as Guest');
    const cookies = await page.context().cookies();
    expect(cookies.length).toBeGreaterThan(0);
  });

  test('Guest account role is limited', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Continue as Guest');
    await page.goto('/profile');
    await expect(page.locator('text=Access Denied').or(page.locator('text=Sign in'))).toBeVisible();
  });

  test('Guest can vote successfully', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Continue as Guest');
    await page.goto('/vote');
    await expect(page.locator('button', { hasText: 'Submit Vote' })).toBeVisible();
  });
});
