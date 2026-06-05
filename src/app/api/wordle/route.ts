import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src/data/db.json');

export async function GET() {
  try {
    let dbData = { wordleWord: "MALTY", wordleHint: "Describes an ale with a sweet, biscuit-like flavor derived from barley." };
    if (fs.existsSync(dbPath)) {
      try {
        dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      } catch (e) {
        // fallback
      }
    }
    
    // Return only public configurations (do not expose wordleWord in lower case or plain text directly if we want to prevent trivial cheat inspects, but for simplicity we return wordleWord capitalized)
    return NextResponse.json({
      word: dbData.wordleWord || "MALTY",
      hint: dbData.wordleHint || "Describes an ale with a sweet, biscuit-like flavor derived from barley."
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { teamName, score } = await request.json();

    if (!teamName || score === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let dbData = { wordleWord: "MALTY", wordleHint: "", wordleScores: [] as any[] };
    if (fs.existsSync(dbPath)) {
      try {
        dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      } catch (e) {
        // fallback
      }
    }

    if (!dbData.wordleScores) {
      dbData.wordleScores = [];
    }

    const newScore = {
      teamName: teamName.trim().toUpperCase(),
      score: parseInt(score),
      date: new Date().toLocaleDateString('en-GB'),
      timestamp: new Date().toISOString()
    };

    dbData.wordleScores.push(newScore);

    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');

    return NextResponse.json({ success: true, score: newScore });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
