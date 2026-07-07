import { describe, it, expect, vi } from 'vitest';
import LeaderboardPage from '../src/app/leaderboard/page';
import * as actions from '../src/app/actions';
import { prisma } from '../src/lib/db';

vi.mock('../src/app/actions', () => ({
  getSession: vi.fn()
}));

interface LeaderboardJsx {
  props: {
    initialPubs: {
      pub: string;
      pint: string;
      brewery: string;
      score: number;
      ratingsCount: number;
      date: string;
      academicYear: string;
    }[];
  };
}

vi.mock('../src/lib/db', () => ({
  prisma: {
    social: { findMany: vi.fn() },
    rating: { findMany: vi.fn() },
  }
}));

describe('Leaderboard Data Filtering', () => {
  it('truncates to top 10 if unauthenticated', async () => {
    vi.mocked(actions.getSession).mockResolvedValue({ role: 'member', isLoggedIn: false, name: undefined, votingName: undefined });
    
    // Mock 15 pubs
    const mockSocials = Array.from({ length: 15 }).map((_, i) => ({
      pubName: `Pub ${i}`, date: '2024-01-01', active: false, academicYear: '24/25', beerName: 'Pint', breweryName: 'Brewery'
    }));
    const mockRatings = mockSocials.map(s => ({
      pubName: s.pubName, score: 5, userId: '1', socialId: '1', createdAt: new Date()
    }));

    vi.mocked(prisma.social.findMany).mockResolvedValue(mockSocials as never);
    vi.mocked(prisma.rating.findMany).mockResolvedValue(mockRatings as never);

    const jsx = await LeaderboardPage();
    const props = (jsx as unknown as LeaderboardJsx).props;
    expect(props.initialPubs.length).toBeLessThanOrEqual(10);
  });

  it('calculates average score and sorts pubs correctly', async () => {
    vi.mocked(actions.getSession).mockResolvedValue({ role: 'member', isLoggedIn: true, name: 'Member', votingName: undefined });

    const mockSocials = [
      { pubName: 'Pub A', date: '2024-01-01', active: false, academicYear: '24/25', beerName: 'Pint A', breweryName: 'Brewery A' },
      { pubName: 'Pub B', date: '2024-01-02', active: false, academicYear: '24/25', beerName: 'Pint B', breweryName: 'Brewery B' }
    ];
    // Pub A: ratings 5 and 4 -> average 4.5
    // Pub B: ratings 3 and 3 -> average 3.0
    const mockRatings = [
      { pubName: 'Pub A', score: 5, userId: '1', socialId: '1', createdAt: new Date() },
      { pubName: 'Pub A', score: 4, userId: '2', socialId: '1', createdAt: new Date() },
      { pubName: 'Pub B', score: 3, userId: '3', socialId: '2', createdAt: new Date() },
      { pubName: 'Pub B', score: 3, userId: '4', socialId: '2', createdAt: new Date() }
    ];

    vi.mocked(prisma.social.findMany).mockResolvedValue(mockSocials as never);
    vi.mocked(prisma.rating.findMany).mockResolvedValue(mockRatings as never);

    const jsx = await LeaderboardPage();
    const props = (jsx as unknown as LeaderboardJsx).props;

    expect(props.initialPubs).toHaveLength(2);
    expect(props.initialPubs[0].pub).toBe('Pub A');
    expect(props.initialPubs[0].score).toBe(4.5);
    expect(props.initialPubs[0].ratingsCount).toBe(2);
    expect(props.initialPubs[1].pub).toBe('Pub B');
    expect(props.initialPubs[1].score).toBe(3);
    expect(props.initialPubs[1].ratingsCount).toBe(2);
  });
});
