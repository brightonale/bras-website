import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as customHtmlGet, POST as customHtmlPost } from '../src/app/api/committee/custom-html/route';
import { GET as activeVotesGet, DELETE as activeVotesDelete } from '../src/app/api/committee/active-votes/route';
import { GET as activePintGet } from '../src/app/api/active-pint/route';
import { POST as ratePost, GET as rateGet } from '../src/app/api/rate/route';
import * as actions from '../src/app/actions';
import { prisma } from '../src/lib/db';

vi.mock('../src/app/actions', () => ({
  getSession: vi.fn()
}));

vi.mock('../src/lib/db', () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    social: {
      findFirst: vi.fn(),
    },
    rating: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }
  }
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
  }))
}));

describe('API Authorization & Committee Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('custom-html GET returns 401 for non-committee', async () => {
    vi.mocked(actions.getSession).mockResolvedValue({ role: 'member', isLoggedIn: true, name: 'test', votingName: 'test' });
    const response = await customHtmlGet();
    expect(response.status).toBe(401);
  });

  it('custom-html POST returns 401 for non-committee', async () => {
    vi.mocked(actions.getSession).mockResolvedValue({ role: 'member', isLoggedIn: true, name: 'test', votingName: 'test' });
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({}) });
    const response = await customHtmlPost(req);
    expect(response.status).toBe(401);
  });

  it('active-votes GET returns 401 for non-committee', async () => {
    vi.mocked(actions.getSession).mockResolvedValue({ role: 'member', isLoggedIn: true, name: 'test', votingName: 'test' });
    const response = await activeVotesGet();
    expect(response.status).toBe(401);
  });

  it('active-votes DELETE returns 401 for non-committee', async () => {
    vi.mocked(actions.getSession).mockResolvedValue({ role: 'member', isLoggedIn: true, name: 'test', votingName: 'test' });
    const req = new Request('http://localhost?id=vote1', { method: 'DELETE' });
    const response = await activeVotesDelete(req);
    expect(response.status).toBe(401);
  });

  it('active-votes GET returns active votes for committee', async () => {
    vi.mocked(actions.getSession).mockResolvedValue({ role: 'committee', isLoggedIn: true, name: 'admin', votingName: 'Admin' });
    vi.mocked(prisma.social.findFirst).mockResolvedValue({
      id: 'social-1',
      date: '24 Sep 2026',
      pubName: 'Hand in Hand',
      beerName: 'Black Rock',
      breweryName: 'Kemptown',
      academicYear: '26/27',
      active: true,
      coverPhotoUrl: null
    });
    vi.mocked(prisma.rating.findMany).mockResolvedValue([
      {
        id: 'r1',
        score: 8.5,
        userId: 'u1',
        pubName: 'Hand in Hand',
        socialId: 'social-1',
        createdAt: new Date(),
        user: { id: 'u1', name: 'alice', votingName: 'Alice' }
      } as any
    ]);

    const response = await activeVotesGet();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.totalVotes).toBe(1);
    expect(data.averageScore).toBe(8.5);
    expect(data.votes[0].voterName).toBe('Alice');
  });

  it('rate POST returns 401 for unauthenticated user without memberName', async () => {
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ pubName: 'Pub', score: 5 }) });
    const response = await ratePost(req);
    expect(response.status).toBe(401);
  });

  it('rate POST allows passwordless voting with memberName', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 'voter-1',
      name: 'harry',
      votingName: 'Harry',
      role: 'user',
      password: null,
      mustChange: false,
      email: null,
      isLegacy: false
    });
    vi.mocked(prisma.social.findFirst).mockResolvedValue({
      id: 'social-1',
      pubName: 'The Basketmakers',
      beerName: 'Best Bitter',
      breweryName: 'Harveys',
      date: '24 Sep 2026',
      academicYear: '26/27',
      active: true,
      coverPhotoUrl: null
    });
    vi.mocked(prisma.rating.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.rating.create).mockResolvedValue({
      id: 'rate-1',
      score: 8.75,
      userId: 'voter-1',
      pubName: 'The Basketmakers',
      socialId: 'social-1',
      createdAt: new Date()
    });

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        memberName: 'Harry',
        pubName: 'The Basketmakers',
        score: 8.75
      })
    });

    const response = await ratePost(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.rating.score).toBe(8.75);
    expect(data.rating.updated).toBe(false);
  });

  it('rate POST updates rating when voter already submitted for active pint (deduplication)', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: 'voter-1',
      name: 'harry',
      votingName: 'Harry',
      role: 'user',
      password: null,
      mustChange: false,
      email: null,
      isLegacy: false
    });
    vi.mocked(prisma.social.findFirst).mockResolvedValue({
      id: 'social-1',
      pubName: 'The Basketmakers',
      beerName: 'Best Bitter',
      breweryName: 'Harveys',
      date: '24 Sep 2026',
      academicYear: '26/27',
      active: true,
      coverPhotoUrl: null
    });
    // Existing rating found -> should update
    vi.mocked(prisma.rating.findFirst).mockResolvedValue({
      id: 'rate-1',
      score: 7.0,
      userId: 'voter-1',
      pubName: 'The Basketmakers',
      socialId: 'social-1',
      createdAt: new Date()
    });
    vi.mocked(prisma.rating.update).mockResolvedValue({
      id: 'rate-1',
      score: 9.0,
      userId: 'voter-1',
      pubName: 'The Basketmakers',
      socialId: 'social-1',
      createdAt: new Date()
    });

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        memberName: 'Harry',
        pubName: 'The Basketmakers',
        score: 9.0
      })
    });

    const response = await ratePost(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.rating.score).toBe(9.0);
    expect(data.rating.updated).toBe(true);
    expect(prisma.rating.update).toHaveBeenCalled();
  });

  it('active-votes GET queries ratings strictly scoped to socialId', async () => {
    vi.mocked(actions.getSession).mockResolvedValue({ role: 'committee', isLoggedIn: true, name: 'admin', votingName: 'Admin' });
    vi.mocked(prisma.social.findFirst).mockResolvedValue({
      id: 'active-social-99',
      date: '24 Sep 2026',
      pubName: 'The Evening Star',
      beerName: 'Dark Star Hophead',
      breweryName: 'Dark Star',
      academicYear: '26/27',
      active: true,
      coverPhotoUrl: null
    });
    vi.mocked(prisma.rating.findMany).mockResolvedValue([]);

    await activeVotesGet();
    expect(prisma.rating.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { socialId: 'active-social-99' }
      })
    );
  });

  it('active-votes DELETE rejects deleting votes belonging to other socials', async () => {
    vi.mocked(actions.getSession).mockResolvedValue({ role: 'committee', isLoggedIn: true, name: 'admin', votingName: 'Admin' });
    vi.mocked(prisma.social.findFirst).mockResolvedValue({
      id: 'active-social-current',
      active: true
    } as any);
    // Rating belongs to an older social
    vi.mocked(prisma.rating.findUnique).mockResolvedValue({
      id: 'old-vote-1',
      socialId: 'historical-social-from-2024'
    } as any);

    const req = new Request('http://localhost?id=old-vote-1', { method: 'DELETE' });
    const response = await activeVotesDelete(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Vote does not belong to the active pint session');
    expect(prisma.rating.delete).not.toHaveBeenCalled();
  });

  it('active-votes DELETE successfully deletes vote belonging to active social', async () => {
    vi.mocked(actions.getSession).mockResolvedValue({ role: 'committee', isLoggedIn: true, name: 'admin', votingName: 'Admin' });
    vi.mocked(prisma.social.findFirst).mockResolvedValue({
      id: 'active-social-current',
      active: true
    } as any);
    vi.mocked(prisma.rating.findUnique).mockResolvedValue({
      id: 'active-vote-1',
      socialId: 'active-social-current'
    } as any);

    const req = new Request('http://localhost?id=active-vote-1', { method: 'DELETE' });
    const response = await activeVotesDelete(req);
    expect(response.status).toBe(200);
    expect(prisma.rating.delete).toHaveBeenCalledWith({ where: { id: 'active-vote-1' } });
  });

  it('active-pint GET returns null when no social has active: true', async () => {
    vi.mocked(prisma.social.findFirst).mockResolvedValue(null);
    const response = await activePintGet();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.activePint).toBeNull();
  });
});

