import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src/data/db.json');

export async function POST(request: Request) {
  try {
    const { word, hint, role } = await request.json();

    // Verification check (for simplicity, we verify the role or expect committee validation)
    if (role !== 'committee') {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    if (!word || word.trim().length !== 5) {
      return NextResponse.json({ error: "Word must be exactly 5 letters" }, { status: 400 });
    }

    let dbData = { wordleWord: "MALTY", wordleHint: "", wordleScores: [], customPages: [], events: [] };
    if (fs.existsSync(dbPath)) {
      try {
        dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      } catch (e) {
        // fallback
      }
    }

    dbData.wordleWord = word.trim().toUpperCase();
    dbData.wordleHint = hint || "";

    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');

    return NextResponse.json({ success: true, word: dbData.wordleWord, hint: dbData.wordleHint });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
