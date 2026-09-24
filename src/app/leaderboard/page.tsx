import { getSession } from '@/app/actions';
import LeaderboardClient from './LeaderboardClient';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

function normalizeAcademicYear(yearStr: string, dateStr: string): string {
  if (yearStr === '2025/2026' || yearStr === '25/26') return '25/26';
  if (yearStr === '2024/2025' || yearStr === '24/25') return '24/25';
  if (yearStr === '2023/2024' || yearStr === '23/24') return '23/24';
  if (yearStr === '2026/2027' || yearStr === '26/27') return '26/27';

  const parts = (dateStr || '').split(' ');
  if (parts.length === 3) {
    const month = parts[1];
    const year = parseInt(parts[2], 10);
    const months2025 = ['Sep', 'Oct', 'Nov', 'Dec'];
    const months2026 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    if ((year === 2025 && months2025.includes(month)) || (year === 2026 && months2026.includes(month))) {
      return '25/26';
    }
  }
  return yearStr || '25/26';
}

export default async function LeaderboardPage() {
  const session = await getSession();
  const isLoggedIn = session.isLoggedIn;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let initialPubs: any[] = [];
  try {
    // 1. Fetch all socials
    const socials = await prisma.social.findMany({
      orderBy: { date: 'asc' }
    });

    // 2. Fetch all ratings
    const ratings = await prisma.rating.findMany();

    // 3. Map socials by id and pubName
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const socialById = new Map<string, any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const socialsByPub = new Map<string, any[]>();

    for (const s of socials) {
      if (s.id) {
        socialById.set(s.id, s);
      }
      if (!socialsByPub.has(s.pubName)) {
        socialsByPub.set(s.pubName, []);
      }
      socialsByPub.get(s.pubName)!.push(s);
    }

    // 4. Group ratings by evaluated pint event
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const socialRatings = new Map<string, { social: any; pubName: string; ratings: any[] }>();

    for (const r of ratings) {
      let targetSocial = null;
      if (r.socialId && socialById.has(r.socialId)) {
        targetSocial = socialById.get(r.socialId);
      } else if (socialsByPub.has(r.pubName)) {
        const candidates = socialsByPub.get(r.pubName)!;
        if (candidates.length === 1) {
          targetSocial = candidates[0];
        } else {
          targetSocial = candidates.find(c => c.id && c.id === r.socialId) || candidates[0];
        }
      }

      const key = targetSocial 
        ? (targetSocial.id || `${targetSocial.pubName}-${targetSocial.date}-${targetSocial.beerName}`) 
        : r.pubName;

      if (!socialRatings.has(key)) {
        socialRatings.set(key, {
          social: targetSocial,
          pubName: targetSocial ? targetSocial.pubName : r.pubName,
          ratings: []
        });
      }
      socialRatings.get(key)!.ratings.push(r);
    }

    // 5. Format pints for the client
    for (const [key, item] of socialRatings.entries()) {
      const s = item.social;
      const count = item.ratings.length;
      if (count === 0) continue;
      const totalScore = item.ratings.reduce((acc, r) => acc + r.score, 0);
      const score = parseFloat((totalScore / count).toFixed(2));

      initialPubs.push({
        id: s?.id || key,
        pub: item.pubName,
        pint: s?.beerName || 'Cask Ale',
        brewery: s?.breweryName || 'Local Brewery',
        score,
        ratingsCount: count,
        date: s?.date || 'Historic',
        academicYear: normalizeAcademicYear(s?.academicYear || '25/26', s?.date || '')
      });
    }

    // 6. Sort descending by score
    initialPubs.sort((a, b) => b.score - a.score);

  } catch (err) {
    console.error('Failed to load dynamic leaderboard data:', err);
  }

  // Server-side filtering to prevent exposure of full leaderboard
  const finalPubs = isLoggedIn ? initialPubs : initialPubs.slice(0, 10);

  return <LeaderboardClient initialPubs={finalPubs} isLoggedIn={isLoggedIn} />;
}

