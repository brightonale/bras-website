import { describe, it, expect, vi } from 'vitest';
import { login, createAccount } from '../src/app/actions';
import { prisma } from '../src/lib/db';

vi.mock('../src/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    }
  }
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    set: vi.fn(),
    get: vi.fn(),
  }))
}));

describe('Auth Actions', () => {
  it('login fails with invalid credentials', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const result = await login('fake', 'password');
    expect(result.error).toBe('Invalid credentials.');
  });

  it('createAccount assigns member role by default', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: '1', name: 'newuser', role: 'member', password: 'hashedpassword', mustChange: false, votingName: null
    });

    const result = await createAccount('newuser', 'pass');
    expect(result.success).toBe(true);
    expect(result.user.role).toBe('member');
  });
});
