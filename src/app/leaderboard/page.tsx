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

  // Group and aggregate
  const pubStats = new Map();
  for (const r of ratings) {
    if (!pubStats.has(r.pubName)) {
      pubStats.set(r.pubName, { 
        pub: r.pubName, 
        scoreSum: 0, 
        count: 0, 
        date: r.social?.date || r.createdAt.toISOString().split('T')[0], 
        academicYear: r.social?.academicYear || '25/26' 
      });
    }
    const stat = pubStats.get(r.pubName);
    stat.scoreSum += r.score;
    stat.count++;
  }

  const initialPubs = Array.from(pubStats.values()).map(stat => ({
    pub: stat.pub,
    score: stat.scoreSum / stat.count,
    ratingsCount: stat.count,
    date: stat.date,
    academicYear: stat.academicYear,
  }));

  return <LeaderboardClient initialPubs={initialPubs} isLoggedIn={isLoggedIn} />;
}
