import { prisma } from '@/lib/db';
import { getSession } from '@/app/actions';
import LeaderboardClient from './LeaderboardClient';

export default async function LeaderboardPage() {
  const session = await getSession();
  const isLoggedIn = session.isLoggedIn;

  // Fetch all ratings
  const ratings = await prisma.rating.findMany({
    include: { social: true }
  });

  // Group and aggregate by pubName + date
  const pubStats = new Map();
  for (const r of ratings) {
    const date = r.social?.date || r.createdAt.toISOString().split('T')[0];
    const key = `${r.pubName}_${date}`;

    if (!pubStats.has(key)) {
      pubStats.set(key, { 
        pub: r.pubName, 
        pint: r.social?.beerName || "Cask Ale",
        brewery: r.social?.breweryName || "Local Brewery",
        scoreSum: 0, 
        count: 0, 
        date: date, 
        academicYear: r.social?.academicYear || '25/26' 
      });
    }
    const stat = pubStats.get(key);
    stat.scoreSum += r.score;
    stat.count++;
  }

  const initialPubs = Array.from(pubStats.values()).map(stat => ({
    pub: stat.pub,
    pint: stat.pint,
    brewery: stat.brewery,
    score: stat.scoreSum / stat.count,
    ratingsCount: stat.count === 1 ? 'Consensus' : stat.count.toString(),
    date: stat.date,
    academicYear: stat.academicYear,
  }));

  return <LeaderboardClient initialPubs={initialPubs} isLoggedIn={isLoggedIn} />;
}
