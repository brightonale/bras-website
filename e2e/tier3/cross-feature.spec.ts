import { test, expect } from '@playwright/test';

// Tier 3: Cross-Feature Combinations

test.describe('Tier 3: Cross-Feature Interactions', () => {

  // 1. Guest Sign-up + Member Dashboard
  test('Guest account should be denied access to member dashboard', async ({ page }) => {
    // Attempt to sign up as guest
    await page.goto('/login');
    await page.getByRole('button', { name: /continue as guest/i }).click();
    
    // Navigate to member dashboard
    await page.goto('/profile');
    
    // Should be redirected or shown an access denied message
    await expect(page.locator('body')).toContainText(/access denied|login/i);
    // Or URL should not be /profile
    expect(page.url()).not.toContain('/profile');
  });

  // 2. Legacy Password Reset + Claim Account
  test('Legacy user can claim account using universal password from reset script', async ({ page }) => {
    // Note: Assuming the reset script sets password to 'UniversalTempPassword123!'
    await page.goto('/login');
    
    await page.getByRole('button', { name: /claim legacy account/i }).click();
    await page.getByLabel(/legacy username/i).fill('TestLegacyUser');
    await page.getByLabel(/password/i).fill('UniversalTempPassword123!');
    
    await page.getByRole('button', { name: /submit claim/i }).click();
    
    // Should enter a pending state
    await expect(page.locator('body')).toContainText(/claim pending|submitted/i);
  });

  // 3. Standard Sign-up + Claim Account
  test('Standard account can submit a claim for a legacy profile', async ({ page }) => {
    await page.goto('/login');
    
    // Sign up as standard user
    await page.getByRole('button', { name: /create standard account/i }).click();
    await page.getByLabel(/username/i).fill('NewStandardUser');
    await page.getByLabel(/password/i).fill('SecurePass123');
    await page.getByRole('button', { name: /sign up/i }).click();
    
    // Now attempt to claim a legacy profile
    await page.goto('/claim'); // or accessible via some UI button
    await page.getByLabel(/legacy username/i).fill('OldLegacyUser');
    await page.getByLabel(/universal password/i).fill('UniversalTempPassword123!');
    await page.getByRole('button', { name: /claim/i }).click();
    
    await expect(page.locator('body')).toContainText(/pending/i);
  });

  // 4. Guest Sign-up + Claim Account
  test('Guest account cannot claim a legacy profile without upgrading', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /continue as guest/i }).click();
    
    await page.goto('/claim');
    
    // Should require standard account / login
    await expect(page.locator('body')).toContainText(/must be a standard member|login/i);
  });

  // 5. Standard Sign-up + Member Dashboard
  test('Standard user has an empty member dashboard initially', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByRole('button', { name: /create standard account/i }).click();
    await page.getByLabel(/username/i).fill('EmptyDashboardUser');
    await page.getByLabel(/password/i).fill('SecurePass123');
    await page.getByRole('button', { name: /sign up/i }).click();
    
    await page.goto('/profile');
    
    // Should see dashboard but no ratings
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    await expect(page.locator('body')).toContainText(/no ratings yet/i);
  });

  // 6. Claim Account + Member Dashboard (Pending State)
  test('Claimed account shows pending status on member dashboard without revealing ratings', async ({ page }) => {
    await page.goto('/login');
    
    // Submit claim
    await page.getByRole('button', { name: /claim legacy account/i }).click();
    await page.getByLabel(/legacy username/i).fill('PendingLegacyUser');
    await page.getByLabel(/password/i).fill('UniversalTempPassword123!');
    await page.getByRole('button', { name: /submit claim/i }).click();
    
    // Check dashboard
    await page.goto('/profile');
    await expect(page.locator('body')).toContainText(/claim pending/i);
    await expect(page.locator('body')).not.toContainText(/highest rated pint/i);
  });

  // 7. Guest Sign-up + Committee Dashboard
  test('Guest account is denied access to committee dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /continue as guest/i }).click();
    
    await page.goto('/committee');
    await expect(page.locator('body')).toContainText(/access denied|unauthorized/i);
  });

  // 8. Standard Sign-up + Committee Dashboard
  test('Standard account is denied access to committee dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /create standard account/i }).click();
    await page.getByLabel(/username/i).fill('NormalUser');
    await page.getByLabel(/password/i).fill('SecurePass123');
    await page.getByRole('button', { name: /sign up/i }).click();
    
    await page.goto('/committee');
    await expect(page.locator('body')).toContainText(/access denied|unauthorized/i);
  });

  // 9. Committee Claim Approval + Member Dashboard
  test('Approved claim transfers ratings and populates member dashboard fun facts', async ({ page, context }) => {
    // 1. User submits claim
    await page.goto('/login');
    await page.getByRole('button', { name: /claim legacy account/i }).click();
    await page.getByLabel(/new username/i).fill('FutureApprovedUser');
    await page.getByLabel(/legacy username/i).fill('RichLegacyUser');
    await page.getByLabel(/password/i).fill('UniversalTempPassword123!');
    await page.getByRole('button', { name: /submit/i }).click();

    // 2. Committee logs in and approves
    // Simulating a separate session or clearing cookies
    await context.clearCookies();
    await page.goto('/login');
    await page.getByLabel(/username/i).fill('CommitteeAdmin');
    await page.getByLabel(/password/i).fill('AdminPass123');
    await page.getByRole('button', { name: /log in/i }).click();
    
    await page.goto('/committee');
    // Find the claim and approve
    const claimRow = page.locator('tr', { hasText: 'RichLegacyUser' });
    await claimRow.getByRole('button', { name: /approve/i }).click();

    // 3. User logs back in and checks dashboard
    await context.clearCookies();
    await page.goto('/login');
    await page.getByLabel(/username/i).fill('FutureApprovedUser');
    await page.getByLabel(/password/i).fill('UniversalTempPassword123!'); // or whatever their new pass is
    await page.getByRole('button', { name: /log in/i }).click();
    
    await page.goto('/profile');
    await expect(page.locator('body')).toContainText(/highest rated pint/i);
    await expect(page.locator('body')).toContainText(/first social/i);
  });

  // 10. Legacy Password Reset + Direct Login
  test('Legacy users cannot directly access standard features without claiming', async ({ page }) => {
    await page.goto('/login');
    
    // Try to log in as legacy user directly
    await page.getByLabel(/username/i).fill('UnclaimedLegacyUser');
    await page.getByLabel(/password/i).fill('UniversalTempPassword123!');
    await page.getByRole('button', { name: /log in/i }).click();
    
    // Should be prompted to complete claim process, not given immediate standard access
    await expect(page.locator('body')).toContainText(/claim your account|update profile/i);
  });

});
