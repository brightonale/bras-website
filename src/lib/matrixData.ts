import { prisma } from '@/lib/db';
import historicalMatrix from '@/data/historical_matrix.json';
import historicalMembers from '@/data/historical_members.json';

export interface MatrixMemberRow {
  member: string;
  ratings: Record<string, number | null>;
  pubsVisited: number;
  totalRatings: number;
  avgScore: number | null;
  highestScore: number | null;
  lowestScore: number | null;
  favoritePub: string | null;
  toughestPub: string | null;
  rank: number;
}

export interface PubSummary {
  pub: string;
  ratingsCount: number;
  averageScore: number | null;
  highestScore: number | null;
  lowestScore: number | null;
  ratingsDistribution: {
    excellent: number; // 8.0+
    good: number;      // 6.0-7.9
    average: number;   // 4.0-5.9
    poor: number;      // <4.0
  };
}

export interface SocietyMatrixStats {
  totalMembers: number;
  totalPubs: number;
  totalRatingsLogged: number;
  societyAverage: number;
  mostAttendedPub: { pub: string; count: number } | null;
  highestRatedPub: { pub: string; score: number } | null;
  lowestRatedPub: { pub: string; score: number } | null;
  mostGenerousMember: { member: string; score: number } | null;
  harshestCritic: { member: string; score: number } | null;
}

export interface CompleteMatrixData {
  pubs: string[];
  rows: MatrixMemberRow[];
  pubSummaries: Record<string, PubSummary>;
  stats: SocietyMatrixStats;
}

export async function getCompleteMatrixData(): Promise<CompleteMatrixData> {
  // 1. Start with historical pubs and rows
  const pubsSet = new Set<string>(historicalMatrix.pubs);
  const memberRatingsMap = new Map<string, Record<string, number | null>>();

  // Populate from historical matrix
  for (const row of historicalMatrix.rows) {
    memberRatingsMap.set(row.member, { ...row.ratings });
  }

  // 2. Fetch live user ratings from database (excluding system_consensus)
  try {
    const liveRatings = await prisma.rating.findMany({
      where: {
        user: {
          name: {
            not: 'system_consensus'
          }
        }
      },
      include: {
        user: true,
        social: true
      }
    });

    for (const r of liveRatings) {
      if (!r.user) continue;
      const memberName = r.user.votingName || r.user.name;
      const pubName = r.pubName || r.social?.pubName;
      if (!pubName) continue;

      pubsSet.add(pubName);

      if (!memberRatingsMap.has(memberName)) {
        memberRatingsMap.set(memberName, {});
      }

      // Merge or update live rating
      memberRatingsMap.get(memberName)![pubName] = r.score;
    }
  } catch (err) {
    console.warn("Could not query live ratings for matrix, using historical baseline", err);
  }

  const pubs = Array.from(pubsSet);

  // 3. Compute row-level stats for each member
  const rows: MatrixMemberRow[] = [];

  for (const [member, ratings] of memberRatingsMap.entries()) {
    let sum = 0;
    let count = 0;
    let highest: number | null = null;
    let lowest: number | null = null;
    let favPub: string | null = null;
    let toughPub: string | null = null;

    for (const p of pubs) {
      const score = ratings[p];
      if (typeof score === 'number' && !isNaN(score)) {
        sum += score;
        count++;

        if (highest === null || score > highest) {
          highest = score;
          favPub = p;
        }
        if (lowest === null || score < lowest) {
          lowest = score;
          toughPub = p;
        }
      } else {
        ratings[p] = null;
      }
    }

    const avg = count > 0 ? parseFloat((sum / count).toFixed(2)) : null;

    rows.push({
      member,
      ratings,
      pubsVisited: count,
      totalRatings: count,
      avgScore: avg,
      highestScore: highest !== null ? parseFloat(highest.toFixed(2)) : null,
      lowestScore: lowest !== null ? parseFloat(lowest.toFixed(2)) : null,
      favoritePub: favPub,
      toughestPub: toughPub,
      rank: 0 // calculated next
    });
  }

  // Sort by pubsVisited desc, then avgScore desc
  rows.sort((a, b) => {
    if (b.pubsVisited !== a.pubsVisited) {
      return b.pubsVisited - a.pubsVisited;
    }
    return (b.avgScore || 0) - (a.avgScore || 0);
  });

  // Assign ranks
  rows.forEach((r, idx) => {
    r.rank = idx + 1;
  });

  // 4. Compute pub summaries
  const pubSummaries: Record<string, PubSummary> = {};

  for (const p of pubs) {
    let pSum = 0;
    let pCount = 0;
    let pHighest: number | null = null;
    let pLowest: number | null = null;
    const distribution = { excellent: 0, good: 0, average: 0, poor: 0 };

    for (const row of rows) {
      const score = row.ratings[p];
      if (typeof score === 'number' && score !== null) {
        pSum += score;
        pCount++;

        if (pHighest === null || score > pHighest) pHighest = score;
        if (pLowest === null || score < pLowest) pLowest = score;

        if (score >= 8.0) distribution.excellent++;
        else if (score >= 6.0) distribution.good++;
        else if (score >= 4.0) distribution.average++;
        else distribution.poor++;
      }
    }

    const pAvg = pCount > 0 ? parseFloat((pSum / pCount).toFixed(2)) : null;

    pubSummaries[p] = {
      pub: p,
      ratingsCount: pCount,
      averageScore: pAvg,
      highestScore: pHighest !== null ? parseFloat(pHighest.toFixed(2)) : null,
      lowestScore: pLowest !== null ? parseFloat(pLowest.toFixed(2)) : null,
      ratingsDistribution: distribution
    };
  }

  // 5. Calculate overall society statistics
  let grandSum = 0;
  let grandCount = 0;
  let mostAttended: { pub: string; count: number } | null = null;
  let highestPub: { pub: string; score: number } | null = null;
  let lowestPub: { pub: string; score: number } | null = null;
  let mostGenerous: { member: string; score: number } | null = null;
  let harshest: { member: string; score: number } | null = null;

  for (const [p, summary] of Object.entries(pubSummaries)) {
    if (summary.ratingsCount > 0 && summary.averageScore !== null) {
      grandSum += summary.averageScore * summary.ratingsCount;
      grandCount += summary.ratingsCount;

      if (!mostAttended || summary.ratingsCount > mostAttended.count) {
        mostAttended = { pub: p, count: summary.ratingsCount };
      }
      if (!highestPub || summary.averageScore > highestPub.score) {
        highestPub = { pub: p, score: summary.averageScore };
      }
      if (!lowestPub || summary.averageScore < lowestPub.score) {
        lowestPub = { pub: p, score: summary.averageScore };
      }
    }
  }

  // Find harshest critic & most generous member (among members who attended at least 3 pubs)
  const qualifiedMembers = rows.filter(r => r.pubsVisited >= 3 && r.avgScore !== null);
  for (const q of qualifiedMembers) {
    if (!mostGenerous || (q.avgScore! > mostGenerous.score)) {
      mostGenerous = { member: q.member, score: q.avgScore! };
    }
    if (!harshest || (q.avgScore! < harshest.score)) {
      harshest = { member: q.member, score: q.avgScore! };
    }
  }

  const societyAvg = grandCount > 0 ? parseFloat((grandSum / grandCount).toFixed(2)) : 6.42;

  const stats: SocietyMatrixStats = {
    totalMembers: rows.length,
    totalPubs: pubs.length,
    totalRatingsLogged: grandCount,
    societyAverage: societyAvg,
    mostAttendedPub: mostAttended,
    highestRatedPub: highestPub,
    lowestRatedPub: lowestPub,
    mostGenerousMember: mostGenerous,
    harshestCritic: harshest
  };

  return {
    pubs,
    rows,
    pubSummaries,
    stats
  };
}

export function getHistoricalMemberByName(name: string) {
  const clean = name.toLowerCase().replace(/\s+/g, '');
  return historicalMembers.find(m => m.name.toLowerCase().replace(/\s+/g, '') === clean);
}
