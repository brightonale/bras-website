import { getSession } from '@/app/actions';
import LeaderboardClient from './LeaderboardClient';
import { prisma } from '@/lib/db';

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
    const pubStats: Record<string, { totalScore: number, count: number, latestDate: string, academicYear: string, pint: string, brewery: string }> = {};

    for (const r of ratings) {
      if (!pubStats[r.pubName]) {
        pubStats[r.pubName] = { totalScore: 0, count: 0, latestDate: '', academicYear: '25/26', pint: 'Cask Ale', brewery: 'Local Brewery' };
      }
      pubStats[r.pubName].totalScore += r.score;
      pubStats[r.pubName].count += 1;
    }

    // 4. Assign dates, pints, breweries and academic years from Socials
    for (const s of socials) {
      if (pubStats[s.pubName]) {
        pubStats[s.pubName].latestDate = s.date;
        pubStats[s.pubName].academicYear = s.academicYear || '24/25';
        if (s.beerName) pubStats[s.pubName].pint = s.beerName;
        if (s.breweryName) pubStats[s.pubName].brewery = s.breweryName;
      }
    }

    // 5. Format for the client
    initialPubs = Object.keys(pubStats).map(pubName => {
      const stats = pubStats[pubName];
      return {
        pub: pubName,
        pint: stats.pint,
        brewery: stats.brewery,
        score: parseFloat((stats.totalScore / stats.count).toFixed(2)),
        ratingsCount: stats.count,
        date: stats.latestDate || 'Historic',
        academicYear: stats.academicYear
      };
    });

    // 6. Sort by score descending
    initialPubs.sort((a, b) => b.score - a.score);

  } catch (err) {
    console.error('Failed to load dynamic leaderboard data:', err);
  }

  // Server-side filtering to prevent exposure of full leaderboard
  const finalPubs = isLoggedIn ? initialPubs : initialPubs.slice(0, 10);

  return <LeaderboardClient initialPubs={finalPubs} isLoggedIn={isLoggedIn} />;
}
