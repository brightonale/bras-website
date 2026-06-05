import { getSession } from '@/app/actions';
import LeaderboardClient from './LeaderboardClient';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
  const session = await getSession();
  const isLoggedIn = session.isLoggedIn;

  let initialPubs: any[] = [];
  try {
    // 1. Fetch all socials
    const socials = await prisma.social.findMany({
      orderBy: { date: 'asc' }
    });

    // 2. Fetch all ratings
    const ratings = await prisma.rating.findMany();

    // 3. Aggregate ratings per pub
    const pubStats: Record<string, { totalScore: number, count: number, latestDate: string, academicYear: string }> = {};

    for (const r of ratings) {
      if (!pubStats[r.pubName]) {
        pubStats[r.pubName] = { totalScore: 0, count: 0, latestDate: '', academicYear: '25/26' };
      }
      pubStats[r.pubName].totalScore += r.score;
      pubStats[r.pubName].count += 1;
    }

    // 4. Assign dates and academic years from Socials
    for (const s of socials) {
      if (pubStats[s.pubName]) {
        pubStats[s.pubName].latestDate = s.date;
        pubStats[s.pubName].academicYear = s.academicYear || '24/25';
      }
    }

    // 5. Format for the client
    initialPubs = Object.keys(pubStats).map(pubName => {
      const stats = pubStats[pubName];
      return {
        name: pubName,
        score: parseFloat((stats.totalScore / stats.count).toFixed(2)),
        date: stats.latestDate || 'Historic',
        academicYear: stats.academicYear
      };
    });

    // 6. Sort by score descending
    initialPubs.sort((a, b) => b.score - a.score);

  } catch (err) {
    console.error('Failed to load dynamic leaderboard data:', err);
  }

  return <LeaderboardClient initialPubs={initialPubs} isLoggedIn={isLoggedIn} />;
}
