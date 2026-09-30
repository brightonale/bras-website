import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as ratePost, GET as rateGet } from '../src/app/api/rate/route';
import { prisma } from '../src/lib/db';
import { cookies } from 'next/headers';

vi.mock('../src/app/actions', () => ({
  getSession: vi.fn()
}));

vi.mock('../src/lib/db', () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
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
  cookies: vi.fn()
}));

describe('Empirical Challenger M1_1: Stress Testing Milestone 1', () => {
  let cookieStore: { get: any; set: any };

  beforeEach(() => {
    vi.clearAllMocks();
    cookieStore = {
      get: vi.fn().mockReturnValue(undefined),
      set: vi.fn()
    };
    vi.mocked(cookies).mockResolvedValue(cookieStore as any);
  });

  // =========================================================================
  // 1. RATING BOUNDARY CONDITIONS
  // =========================================================================
  describe('Boundary Conditions for Rating Values', () => {
    beforeEach(() => {
      vi.mocked(prisma.social.findFirst).mockResolvedValue({
        id: 'soc-active-1',
        pubName: 'The Evening Star',
        beerName: 'Hophead',
        breweryName: 'Dark Star',
        academicYear: '26/27',
        active: true,
        date: '24 Sep 2026',
        coverPhotoUrl: null
      });
      vi.mocked(prisma.user.findFirst).mockResolvedValue({
        id: 'u-1',
        name: 'tester',
        votingName: 'Tester',
        role: 'user',
        password: null,
        mustChange: false,
        email: null,
        isLegacy: false
      });
      vi.mocked(prisma.user.update).mockResolvedValue({
        id: 'u-1',
        name: 'tester',
        votingName: 'Tester',
        role: 'user',
        password: null,
        mustChange: false,
        email: null,
        isLegacy: false
      });
      vi.mocked(prisma.rating.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.rating.create).mockImplementation(async (args: any) => ({
        id: 'rate-' + Math.random(),
        score: args.data.score,
        userId: args.data.userId,
        pubName: args.data.pubName,
        socialId: args.data.socialId,
        createdAt: new Date()
      }));
    });

    it('rejects scores below 1.00 (0.99, 0.0, -1.0, -0.01, -Infinity)', async () => {
      const invalidLowScores = [0.99, 0.0, -1.0, -0.01, -Infinity, -999];

      for (const score of invalidLowScores) {
        const req = new Request('http://localhost/api/rate', {
          method: 'POST',
          body: JSON.stringify({
            memberName: 'Tester',
            pubName: 'The Evening Star',
            score
          })
        });
        const res = await ratePost(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe('Missing or invalid data');
      }
    });

    it('rejects scores above 10.00 (10.01, 10.5, 11.0, 100.0, Infinity)', async () => {
      const invalidHighScores = [10.01, 10.5, 11.0, 100.0, Infinity];

      for (const score of invalidHighScores) {
        const req = new Request('http://localhost/api/rate', {
          method: 'POST',
          body: JSON.stringify({
            memberName: 'Tester',
            pubName: 'The Evening Star',
            score
          })
        });
        const res = await ratePost(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe('Missing or invalid data');
      }
    });

    it('accepts exact lower boundary 1.00 and upper boundary 10.00', async () => {
      for (const score of [1.00, 10.00]) {
        const req = new Request('http://localhost/api/rate', {
          method: 'POST',
          body: JSON.stringify({
            memberName: 'Tester',
            pubName: 'The Evening Star',
            score
          })
        });
        const res = await ratePost(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.rating.score).toBe(score);
      }
    });

    it('handles precision decimals properly (7.55, 8.333, 9.99, 1.05)', async () => {
      const decimalTestCases = [
        { input: 7.55, expected: 7.55 },
        { input: 8.333, expected: 8.33 },
        { input: 9.994, expected: 9.99 },
        { input: 9.999, expected: 10.00 },
        { input: 1.05, expected: 1.05 },
        { input: 5.678, expected: 5.68 }
      ];

      for (const { input, expected } of decimalTestCases) {
        const req = new Request('http://localhost/api/rate', {
          method: 'POST',
          body: JSON.stringify({
            memberName: 'Tester',
            pubName: 'The Evening Star',
            score: input
          })
        });
        const res = await ratePost(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.rating.score).toBe(expected);
      }
    });

    it('rejects non-numeric score formats (strings, null, undefined, NaN, objects, arrays)', async () => {
      const nonNumericScores = [
        '7.5',
        '10',
        null,
        undefined,
        NaN,
        {},
        [8],
        true,
        false
      ];

      for (const score of nonNumericScores) {
        const req = new Request('http://localhost/api/rate', {
          method: 'POST',
          body: JSON.stringify({
            memberName: 'Tester',
            pubName: 'The Evening Star',
            score
          })
        });
        const res = await ratePost(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe('Missing or invalid data');
      }
    });
  });

  // =========================================================================
  // 2. VOTER NAME SANITIZATION
  // =========================================================================
  describe('Voter Name Sanitization and Edge Cases', () => {
    beforeEach(() => {
      vi.mocked(prisma.social.findFirst).mockResolvedValue({
        id: 'soc-active-1',
        pubName: 'The Hand in Hand',
        active: true,
        date: '24 Sep 2026',
        academicYear: '26/27',
        beerName: 'Black Rock',
        breweryName: 'Kemptown',
        coverPhotoUrl: null
      });
      vi.mocked(prisma.rating.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.rating.create).mockImplementation(async (args: any) => ({
        id: 'rate-1',
        score: args.data.score,
        userId: args.data.userId,
        pubName: args.data.pubName,
        socialId: args.data.socialId,
        createdAt: new Date()
      }));
    });

    it('rejects empty or whitespace-only voter names with 401 when no session cookie exists', async () => {
      const emptyNames = ['', '   ', '\t', '\n\r  ', null, undefined];

      for (const memberName of emptyNames) {
        const req = new Request('http://localhost/api/rate', {
          method: 'POST',
          body: JSON.stringify({
            memberName,
            pubName: 'The Hand in Hand',
            score: 7.5
          })
        });
        const res = await ratePost(req);
        expect(res.status).toBe(401);
        const data = await res.json();
        expect(data.error).toContain('Unauthorized: Voter name required');
      }
    });

    it('trims leading and trailing whitespace from voter names', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 'u-trimmed',
        name: 'alice',
        votingName: 'Alice',
        role: 'user',
        password: null,
        mustChange: false,
        email: null,
        isLegacy: false
      });

      const req = new Request('http://localhost/api/rate', {
        method: 'POST',
        body: JSON.stringify({
          memberName: '   Alice   ',
          pubName: 'The Hand in Hand',
          score: 8.0
        })
      });

      const res = await ratePost(req);
      expect(res.status).toBe(200);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'alice',
          votingName: 'Alice',
          role: 'user'
        })
      });
    });

    it('handles special characters in voter names (hyphens, apostrophes, ampersands, unicode emoji)', async () => {
      const specialNames = [
        { input: "O'Connor", clean: "o'connor" },
        { input: 'Jean-Luc Picard', clean: 'jean-lucpicard' },
        { input: 'Mary & Bob', clean: 'mary&bob' },
        { input: '🍺 Cask Master', clean: '🍺caskmaster' },
        { input: 'Dr. John Watson, Jr.', clean: 'dr.johnwatson,jr.' }
      ];

      for (const { input, clean } of specialNames) {
        vi.clearAllMocks();
        vi.mocked(prisma.social.findFirst).mockResolvedValue({
          id: 'soc-active-1',
          pubName: 'The Hand in Hand',
          active: true,
          date: '24 Sep 2026',
          academicYear: '26/27',
          beerName: 'Black Rock',
          breweryName: 'Kemptown',
          coverPhotoUrl: null
        });
        vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
        vi.mocked(prisma.user.create).mockResolvedValue({
          id: 'u-special',
          name: clean,
          votingName: input,
          role: 'user',
          password: null,
          mustChange: false,
          email: null,
          isLegacy: false
        });
        vi.mocked(prisma.rating.findFirst).mockResolvedValue(null);
        vi.mocked(prisma.rating.create).mockResolvedValue({
          id: 'rate-special',
          score: 8.0,
          userId: 'u-special',
          pubName: 'The Hand in Hand',
          socialId: 'soc-active-1',
          createdAt: new Date()
        });

        const req = new Request('http://localhost/api/rate', {
          method: 'POST',
          body: JSON.stringify({
            memberName: input,
            pubName: 'The Hand in Hand',
            score: 8.0
          })
        });

        const res = await ratePost(req);
        expect(res.status).toBe(200);
        expect(prisma.user.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            name: clean,
            votingName: input
          })
        });
      }
    });

    it('finds voter regardless of casing differences (Harry vs harry vs HARRY)', async () => {
      // Mock existing user created as "harry"
      vi.mocked(prisma.user.findFirst).mockImplementation(async (args: any) => {
        const orClauses = args.where.OR;
        // Check if any clause matches "harry"
        const matches = orClauses.some((clause: any) =>
          clause.name === 'harry' || clause.votingName === 'Harry'
        );
        if (matches) {
          return {
            id: 'u-harry',
            name: 'harry',
            votingName: 'Harry',
            role: 'user',
            password: null,
            mustChange: false,
            email: null,
            isLegacy: false
          };
        }
        return null;
      });

      vi.mocked(prisma.user.update).mockResolvedValue({
        id: 'u-harry',
        name: 'harry',
        votingName: 'HARRY',
        role: 'user',
        password: null,
        mustChange: false,
        email: null,
        isLegacy: false
      });

      // Submit with uppercase "HARRY"
      const req = new Request('http://localhost/api/rate', {
        method: 'POST',
        body: JSON.stringify({
          memberName: 'HARRY',
          pubName: 'The Hand in Hand',
          score: 7.75
        })
      });

      const res = await ratePost(req);
      expect(res.status).toBe(200);
      // Ensure user was found and updated, not duplicated via create
      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('GET /api/rate handles whitespace and casing variations in voter lookup', async () => {
      vi.mocked(prisma.user.findFirst).mockImplementation(async (args: any) => {
        const orClauses = args.where.OR;
        const matches = orClauses.some((clause: any) =>
          clause.name === 'harry' || clause.votingName === 'Harry'
        );
        if (matches) {
          return {
            id: 'u-harry',
            name: 'harry',
            votingName: 'Harry',
            role: 'user',
            password: null,
            mustChange: false,
            email: null,
            isLegacy: false
          };
        }
        return null;
      });

      vi.mocked(prisma.rating.findFirst).mockResolvedValue({
        id: 'rate-harry',
        score: 8.5,
        userId: 'u-harry',
        pubName: 'The Hand in Hand',
        socialId: 'soc-active-1',
        createdAt: new Date()
      });

      // Query with spaces and different casing
      const req = new Request('http://localhost/api/rate?voterName=%20%20hArRy%20%20', {
        method: 'GET'
      });

      const res = await rateGet(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.alreadyVoted).toBe(true);
      expect(data.existingRating.score).toBe(8.5);
    });
  });

  // =========================================================================
  // 3. REPEATED SUBMISSIONS & DEDUPLICATION (STATEFUL SIMULATION)
  // =========================================================================
  describe('Repeated Submissions and Stateful Deduplication', () => {
    // In-memory stateful store to simulate database operations across sequential calls
    let usersStore: any[];
    let ratingsStore: any[];
    let activeSocialStore: any;

    beforeEach(() => {
      activeSocialStore = {
        id: 'soc-sept24',
        pubName: 'The Basketmakers Arms',
        beerName: 'Best Bitter',
        breweryName: 'Harveys',
        academicYear: '26/27',
        active: true,
        date: '24 Sep 2026',
        coverPhotoUrl: null
      };

      usersStore = [];
      ratingsStore = [];

      vi.mocked(prisma.social.findFirst).mockImplementation(async () => activeSocialStore);

      vi.mocked(prisma.user.findFirst).mockImplementation(async (args: any) => {
        const orList = args.where.OR;
        return usersStore.find(u =>
          orList.some((condition: any) =>
            (condition.name && u.name.toLowerCase() === condition.name.toLowerCase()) ||
            (condition.votingName && u.votingName?.toLowerCase() === condition.votingName.toLowerCase())
          )
        ) || null;
      });

      vi.mocked(prisma.user.create).mockImplementation(async (args: any) => {
        const newUser = {
          id: 'user-' + (usersStore.length + 1),
          ...args.data
        };
        usersStore.push(newUser);
        return newUser;
      });

      vi.mocked(prisma.user.update).mockImplementation(async (args: any) => {
        const idx = usersStore.findIndex(u => u.id === args.where.id);
        if (idx !== -1) {
          usersStore[idx] = { ...usersStore[idx], ...args.data };
          return usersStore[idx];
        }
        throw new Error('User not found');
      });

      vi.mocked(prisma.rating.findFirst).mockImplementation(async (args: any) => {
        return ratingsStore.find(r =>
          r.userId === args.where.userId && r.socialId === args.where.socialId
        ) || null;
      });

      vi.mocked(prisma.rating.create).mockImplementation(async (args: any) => {
        const newRating = {
          id: 'rating-' + (ratingsStore.length + 1),
          ...args.data,
          createdAt: new Date()
        };
        ratingsStore.push(newRating);
        return newRating;
      });

      vi.mocked(prisma.rating.update).mockImplementation(async (args: any) => {
        const idx = ratingsStore.findIndex(r => r.id === args.where.id);
        if (idx !== -1) {
          ratingsStore[idx] = { ...ratingsStore[idx], ...args.data };
          return ratingsStore[idx];
        }
        throw new Error('Rating not found');
      });
    });

    it('multiple sequential votes by the same member update the same rating row in place', async () => {
      // Step 1: Initial vote (7.25★)
      const res1 = await ratePost(new Request('http://localhost/api/rate', {
        method: 'POST',
        body: JSON.stringify({
          memberName: 'Oliver Twist',
          pubName: 'The Basketmakers Arms',
          score: 7.25
        })
      }));
      expect(res1.status).toBe(200);
      const data1 = await res1.json();
      expect(data1.success).toBe(true);
      expect(data1.rating.score).toBe(7.25);
      expect(data1.rating.updated).toBe(false);

      expect(usersStore.length).toBe(1);
      expect(ratingsStore.length).toBe(1);
      const originalRatingId = ratingsStore[0].id;
      expect(ratingsStore[0].score).toBe(7.25);

      // Step 2: Second vote updating score to (8.50★)
      const res2 = await ratePost(new Request('http://localhost/api/rate', {
        method: 'POST',
        body: JSON.stringify({
          memberName: 'Oliver Twist',
          pubName: 'The Basketmakers Arms',
          score: 8.50
        })
      }));
      expect(res2.status).toBe(200);
      const data2 = await res2.json();
      expect(data2.success).toBe(true);
      expect(data2.rating.score).toBe(8.50);
      expect(data2.rating.updated).toBe(true);

      // Verify no duplicate row was created
      expect(ratingsStore.length).toBe(1);
      expect(ratingsStore[0].id).toBe(originalRatingId);
      expect(ratingsStore[0].score).toBe(8.50);

      // Step 3: Third vote updating score to (9.00★) with slight casing variation
      const res3 = await ratePost(new Request('http://localhost/api/rate', {
        method: 'POST',
        body: JSON.stringify({
          memberName: 'oliver twist',
          pubName: 'The Basketmakers Arms',
          score: 9.00
        })
      }));
      expect(res3.status).toBe(200);
      const data3 = await res3.json();
      expect(data3.success).toBe(true);
      expect(data3.rating.score).toBe(9.00);
      expect(data3.rating.updated).toBe(true);

      // Still exactly 1 user and 1 rating in the database!
      expect(usersStore.length).toBe(1);
      expect(ratingsStore.length).toBe(1);
      expect(ratingsStore[0].id).toBe(originalRatingId);
      expect(ratingsStore[0].score).toBe(9.00);
    });

    it('concurrent/rapid sequential submissions deduplicate without creating orphan rows', async () => {
      // Simulate 5 rapid sequential votes from the same user
      const scores = [5.5, 6.0, 7.0, 8.0, 8.75];

      for (let i = 0; i < scores.length; i++) {
        const res = await ratePost(new Request('http://localhost/api/rate', {
          method: 'POST',
          body: JSON.stringify({
            memberName: 'Speedy Voter',
            pubName: 'The Basketmakers Arms',
            score: scores[i]
          })
        }));
        expect(res.status).toBe(200);
      }

      // Assert that exactly 1 user and 1 rating row exist, holding the final score
      expect(usersStore.length).toBe(1);
      expect(ratingsStore.length).toBe(1);
      expect(ratingsStore[0].score).toBe(8.75);
    });
  });

  // =========================================================================
  // 4. COMMITTEE USERS VOTING AS ATTENDEES (ROLE RETENTION)
  // =========================================================================
  describe('Committee Role Retention', () => {
    let usersStore: any[];
    let ratingsStore: any[];

    beforeEach(() => {
      vi.mocked(prisma.social.findFirst).mockResolvedValue({
        id: 'soc-active-1',
        pubName: 'The Evening Star',
        active: true,
        date: '24 Sep 2026',
        academicYear: '26/27',
        beerName: 'Hophead',
        breweryName: 'Dark Star',
        coverPhotoUrl: null
      });

      // Existing committee user
      usersStore = [
        {
          id: 'comm-user-1',
          name: 'president',
          votingName: 'Society President',
          role: 'committee',
          password: '$2b$10$hashedpassword',
          mustChange: false,
          email: 'president@bras.soc',
          isLegacy: false
        },
        {
          id: 'normal-user-1',
          name: 'regularmember',
          votingName: 'Regular Member',
          role: 'user',
          password: null,
          mustChange: false,
          email: null,
          isLegacy: false
        }
      ];
      ratingsStore = [];

      vi.mocked(prisma.user.findFirst).mockImplementation(async (args: any) => {
        const orList = args.where.OR;
        return usersStore.find(u =>
          orList.some((condition: any) =>
            (condition.name && u.name.toLowerCase() === condition.name.toLowerCase()) ||
            (condition.votingName && u.votingName?.toLowerCase() === condition.votingName.toLowerCase())
          )
        ) || null;
      });

      vi.mocked(prisma.user.update).mockImplementation(async (args: any) => {
        const idx = usersStore.findIndex(u => u.id === args.where.id);
        if (idx !== -1) {
          usersStore[idx] = { ...usersStore[idx], ...args.data };
          return usersStore[idx];
        }
        throw new Error('User not found');
      });

      vi.mocked(prisma.rating.findFirst).mockImplementation(async (args: any) => {
        return ratingsStore.find(r => r.userId === args.where.userId) || null;
      });

      vi.mocked(prisma.rating.create).mockImplementation(async (args: any) => {
        const r = { id: 'r-' + Math.random(), ...args.data, createdAt: new Date() };
        ratingsStore.push(r);
        return r;
      });

      vi.mocked(prisma.rating.update).mockImplementation(async (args: any) => {
        const idx = ratingsStore.findIndex(r => r.id === args.where.id);
        if (idx !== -1) {
          ratingsStore[idx] = { ...ratingsStore[idx], ...args.data };
          return ratingsStore[idx];
        }
        throw new Error('Rating not found');
      });
    });

    it('committee user voting retains role "committee" in database', async () => {
      const commUser = usersStore.find(u => u.id === 'comm-user-1');
      expect(commUser.role).toBe('committee');

      // Committee user votes via /rate
      const res = await ratePost(new Request('http://localhost/api/rate', {
        method: 'POST',
        body: JSON.stringify({
          memberName: 'Society President',
          pubName: 'The Evening Star',
          score: 9.5
        })
      }));

      expect(res.status).toBe(200);

      // Verify user's role is STILL 'committee'
      expect(commUser.role).toBe('committee');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'comm-user-1' },
        data: { votingName: 'Society President' }
      });
    });

    it('committee user updating their vote multiple times never gets downgraded to "user"', async () => {
      const commUser = usersStore.find(u => u.id === 'comm-user-1');

      for (const score of [7.5, 8.0, 9.0]) {
        const res = await ratePost(new Request('http://localhost/api/rate', {
          method: 'POST',
          body: JSON.stringify({
            memberName: 'Society President',
            pubName: 'The Evening Star',
            score
          })
        }));
        expect(res.status).toBe(200);
        expect(commUser.role).toBe('committee');
      }

      expect(ratingsStore.length).toBe(1);
      expect(ratingsStore[0].score).toBe(9.0);
    });

    it('regular user voting retains or sets role "user"', async () => {
      const normalUser = usersStore.find(u => u.id === 'normal-user-1');
      expect(normalUser.role).toBe('user');

      const res = await ratePost(new Request('http://localhost/api/rate', {
        method: 'POST',
        body: JSON.stringify({
          memberName: 'Regular Member',
          pubName: 'The Evening Star',
          score: 8.0
        })
      }));

      expect(res.status).toBe(200);
      expect(normalUser.role).toBe('user');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'normal-user-1' },
        data: { votingName: 'Regular Member', role: 'user' }
      });
    });

    it('sets bras_user_role cookie to "committee" if cookie was absent for committee voter', async () => {
      cookieStore.get = vi.fn().mockReturnValue(undefined);

      const res = await ratePost(new Request('http://localhost/api/rate', {
        method: 'POST',
        body: JSON.stringify({
          memberName: 'Society President',
          pubName: 'The Evening Star',
          score: 9.0
        })
      }));

      expect(res.status).toBe(200);
      // Verify response cookie set
      const cookiesSet = res.cookies.getAll();
      const roleCookie = cookiesSet.find(c => c.name === 'bras_user_role');
      expect(roleCookie).toBeDefined();
      expect(roleCookie?.value).toBe('committee');
    });

    it('preserves existing password and email when an account rates', async () => {
      const commUser = usersStore.find(u => u.id === 'comm-user-1');
      const originalPassword = commUser.password;
      const originalEmail = commUser.email;

      await ratePost(new Request('http://localhost/api/rate', {
        method: 'POST',
        body: JSON.stringify({
          memberName: 'Society President',
          pubName: 'The Evening Star',
          score: 8.5
        })
      }));

      expect(commUser.password).toBe(originalPassword);
      expect(commUser.email).toBe(originalEmail);
    });
  });

  // =========================================================================
  // 5. HISTORICAL ISOLATION & MULTI-USER ISOLATION
  // =========================================================================
  describe('Historical Rating and Multi-User Isolation', () => {
    let usersStore: any[];
    let ratingsStore: any[];
    let activeSocialStore: any;

    beforeEach(() => {
      activeSocialStore = {
        id: 'soc-round-2',
        pubName: 'The Evening Star',
        active: true,
        date: '24 Sep 2026',
        academicYear: '26/27',
        beerName: 'Hophead',
        breweryName: 'Dark Star',
        coverPhotoUrl: null
      };

      usersStore = [
        { id: 'u-alice', name: 'alice', votingName: 'Alice', role: 'user' },
        { id: 'u-bob', name: 'bob', votingName: 'Bob', role: 'user' }
      ];

      // Alice already has a historical rating from last week's social
      ratingsStore = [
        {
          id: 'rating-historical-alice',
          userId: 'u-alice',
          pubName: 'The Hand in Hand',
          score: 7.0,
          socialId: 'soc-round-1-past',
          createdAt: new Date('2026-09-17')
        }
      ];

      vi.mocked(prisma.social.findFirst).mockImplementation(async () => activeSocialStore);

      vi.mocked(prisma.user.findFirst).mockImplementation(async (args: any) => {
        const orList = args.where.OR;
        return usersStore.find(u =>
          orList.some((condition: any) =>
            (condition.name && u.name.toLowerCase() === condition.name.toLowerCase()) ||
            (condition.votingName && u.votingName?.toLowerCase() === condition.votingName.toLowerCase())
          )
        ) || null;
      });

      vi.mocked(prisma.user.update).mockImplementation(async (args: any) => {
        const idx = usersStore.findIndex(u => u.id === args.where.id);
        if (idx !== -1) {
          usersStore[idx] = { ...usersStore[idx], ...args.data };
          return usersStore[idx];
        }
        throw new Error('User not found in isolation test store: ' + args.where.id);
      });

      vi.mocked(prisma.rating.findFirst).mockImplementation(async (args: any) => {
        return ratingsStore.find(r =>
          r.userId === args.where.userId && r.socialId === args.where.socialId
        ) || null;
      });

      vi.mocked(prisma.rating.create).mockImplementation(async (args: any) => {
        const newRating = {
          id: 'rating-' + (ratingsStore.length + 1),
          ...args.data,
          createdAt: new Date()
        };
        ratingsStore.push(newRating);
        return newRating;
      });

      vi.mocked(prisma.rating.update).mockImplementation(async (args: any) => {
        const idx = ratingsStore.findIndex(r => r.id === args.where.id);
        if (idx !== -1) {
          ratingsStore[idx] = { ...ratingsStore[idx], ...args.data };
          return ratingsStore[idx];
        }
        throw new Error('Rating not found');
      });
    });

    it('GET /api/rate returns null for voter who rated past round but not current active round', async () => {
      const req = new Request('http://localhost/api/rate?voterName=Alice', { method: 'GET' });
      const res = await rateGet(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.existingRating).toBeNull();
      expect(data.alreadyVoted).toBe(false);
    });

    it('creating rating in active round preserves historical ratings untouched', async () => {
      // Alice votes in round 2
      const res = await ratePost(new Request('http://localhost/api/rate', {
        method: 'POST',
        body: JSON.stringify({
          memberName: 'Alice',
          pubName: 'The Evening Star',
          score: 8.5
        })
      }));

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.rating.updated).toBe(false);

      // Verify Alice now has 2 ratings in total: 1 historical, 1 active
      expect(ratingsStore.length).toBe(2);
      const historical = ratingsStore.find(r => r.id === 'rating-historical-alice');
      expect(historical).toBeDefined();
      expect(historical?.score).toBe(7.0);
      expect(historical?.socialId).toBe('soc-round-1-past');

      const activeRating = ratingsStore.find(r => r.socialId === 'soc-round-2');
      expect(activeRating).toBeDefined();
      expect(activeRating?.score).toBe(8.5);
      expect(activeRating?.userId).toBe('u-alice');
    });

    it('multi-user vote updates are strictly isolated to each voter', async () => {
      // Alice votes 8.0 for active round
      await ratePost(new Request('http://localhost/api/rate', {
        method: 'POST',
        body: JSON.stringify({
          memberName: 'Alice',
          pubName: 'The Evening Star',
          score: 8.0
        })
      }));

      // Bob votes 9.0 for active round
      await ratePost(new Request('http://localhost/api/rate', {
        method: 'POST',
        body: JSON.stringify({
          memberName: 'Bob',
          pubName: 'The Evening Star',
          score: 9.0
        })
      }));

      // Alice updates her vote to 8.5
      await ratePost(new Request('http://localhost/api/rate', {
        method: 'POST',
        body: JSON.stringify({
          memberName: 'Alice',
          pubName: 'The Evening Star',
          score: 8.5
        })
      }));

      const aliceRating = ratingsStore.find(r => r.userId === 'u-alice' && r.socialId === 'soc-round-2');
      const bobRating = ratingsStore.find(r => r.userId === 'u-bob' && r.socialId === 'soc-round-2');

      expect(aliceRating?.score).toBe(8.5);
      expect(bobRating?.score).toBe(9.0);
    });
  });
});
