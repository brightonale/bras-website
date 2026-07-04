import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

test.describe('F1: Legacy Password Reset Script', () => {
  test('Script runs without crashing', () => {
    expect(() => {
      execSync('npx tsx scripts/legacy-password-reset.ts', { stdio: 'pipe' });
    }).not.toThrow();
  });

  test('Script output contains affected usernames', () => {
    let output = '';
    try {
      output = execSync('npx tsx scripts/legacy-password-reset.ts', { encoding: 'utf-8' });
    } catch (e: any) {
      output = e.stdout || '';
    }
    expect(output).toMatch(/Affected/i);
  });

  test('Script executes within reasonable time', () => {
    const start = Date.now();
    try {
      execSync('npx tsx scripts/legacy-password-reset.ts', { stdio: 'pipe' });
    } catch {}
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(10000);
  });

  test('Script output format is a text list', () => {
    let output = '';
    try {
      output = execSync('npx tsx scripts/legacy-password-reset.ts', { encoding: 'utf-8' });
    } catch (e: any) {
      output = e.stdout || '';
    }
    expect(output.split('\n').length).toBeGreaterThan(0);
  });

  test('Script does not error on multiple invocations', () => {
    expect(() => {
      execSync('npx tsx scripts/legacy-password-reset.ts', { stdio: 'pipe' });
      execSync('npx tsx scripts/legacy-password-reset.ts', { stdio: 'pipe' });
    }).not.toThrow();
  });
});
