import { describe, it, expect, vi } from 'vitest';
import LeaderboardPage from '../src/app/leaderboard/page';
import * as actions from '../src/app/actions';
import { prisma } from '../src/lib/db';

vi.mock('../src/app/actions', () => ({
  getSession: vi.fn()
}));

vi.mock('../src/lib/db', () => ({
  prisma: {
    social: { findMany: vi.fn() },
    rating: { findMany: vi.fn() },
  }
}));

describe('Leaderboard Data Filtering', () => {
  it('truncates to top 10 if unauthenticated', async () => {
    vi.mocked(actions.getSession).mockResolvedValue({ role: 'member', isLoggedIn: false, name: null, votingName: null });
    
    // Mock 15 pubs
    const mockSocials = Array.from({ length: 15 }).map((_, i) => ({
      pubName: `Pub ${i}`, date: '2024-01-01', active: false, academicYear: '24/25', beerName: 'Pint', breweryName: 'Brewery'
    }));
    const mockRatings = mockSocials.map(s => ({
      pubName: s.pubName, score: 5, userId: '1', socialId: '1', createdAt: new Date()
    }));

    vi.mocked(prisma.social.findMany).mockResolvedValue(mockSocials as any);
    vi.mocked(prisma.rating.findMany).mockResolvedValue(mockRatings as any);

    const jsx = await LeaderboardPage();
    const props = (jsx as any).props;
    expect(props.initialPubs.length).toBeLessThanOrEqual(10);
  });
});
