import fs from 'fs';
import path from 'path';
import { getSession } from '@/app/actions';
import LeaderboardClient from './LeaderboardClient';

export default async function LeaderboardPage() {
  const session = await getSession();
  const isLoggedIn = session.isLoggedIn;

  const dataPath = path.join(process.cwd(), 'src/data/leaderboard.json');
  let initialPubs = [];
  try {
    const raw = fs.readFileSync(dataPath, 'utf-8');
    const parsed = JSON.parse(raw);
    
    // Add academicYear calculation
    initialPubs = parsed.map((p: any) => {
      let acYear = '25/26';
      if (p.date) {
        if (p.date.includes('/')) {
            acYear = p.date;
        } else {
            try {
              const d = new Date(p.date);
              if (!isNaN(d.getTime())) {
                  const year = d.getFullYear();
                  const month = d.getMonth(); // 0-11
                  if (month >= 8) { // Sept or later
                     acYear = `${year.toString().slice(2)}/${(year+1).toString().slice(2)}`;
                  } else {
                     acYear = `${(year-1).toString().slice(2)}/${year.toString().slice(2)}`;
                  }
              }
            } catch(e) {}
        }
      }
      return { 
        ...p, 
        score: parseFloat(p.score), 
        academicYear: acYear,
        date: p.date.includes('/') ? "Historic" : p.date 
      };
    });
  } catch (err) {
    console.error('Failed to load leaderboard data:', err);
  }

  return <LeaderboardClient initialPubs={initialPubs} isLoggedIn={isLoggedIn} />;
}
