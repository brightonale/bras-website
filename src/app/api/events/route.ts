import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src/data/db.json');

export async function GET() {
  try {
    let dbData: any = { events: [], newRatings: [] };
    if (fs.existsSync(dbPath)) {
      try {
        dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      } catch (e) {
        // fallback
      }
    }

    const events = (dbData.events || []).map((evt: any) => {
      const matchRatings = (dbData.newRatings || []).filter((r: any) => 
        r.pubName.toLowerCase() === evt.pub.toLowerCase() && 
        r.dateString === evt.date
      );

      if (matchRatings.length > 0) {
        const sum = matchRatings.reduce((acc: number, curr: any) => acc + curr.score, 0);
        return {
          ...evt,
          score: sum / matchRatings.length,
          ratingsCount: matchRatings.length.toString()
        };
      }
      return evt;
    });

    return NextResponse.json({
      success: true,
      events,
      newRatings: dbData.newRatings || []
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
