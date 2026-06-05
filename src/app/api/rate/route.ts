import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src/data/db.json');

export async function POST(request: Request) {
  try {
    const { memberName, pubName, beerName, score, dateString } = await request.json();

    if (!memberName || !pubName || !score) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Read existing database
    let dbData = { wordleWord: "MALTY", wordleHint: "", wordleScores: [], customPages: [], events: [], newRatings: [] as any[] };
    if (fs.existsSync(dbPath)) {
      try {
        dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      } catch (e) {
        // use default
      }
    }

    if (!dbData.newRatings) {
      dbData.newRatings = [];
    }

    const newRating = {
      id: 'rating-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      memberName,
      pubName,
      beerName: beerName || "Cask Ale",
      score: parseFloat(score),
      dateString: dateString || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      timestamp: new Date().toISOString()
    };

    dbData.newRatings.push(newRating);

    // Write back to db.json
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');

    return NextResponse.json({ success: true, rating: newRating });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
