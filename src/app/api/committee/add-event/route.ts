import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src/data/db.json');

export async function POST(request: Request) {
  try {
    const { pubName, pintName, breweryName, dateString, role } = await request.json();

    if (role !== 'committee') {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    if (!pubName) {
      return NextResponse.json({ error: "Pub name is required" }, { status: 400 });
    }

    let dbData = { wordleWord: "MALTY", wordleHint: "", wordleScores: [], customPages: [], events: [] as any[] };
    if (fs.existsSync(dbPath)) {
      try {
        dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      } catch (e) {
        // fallback
      }
    }

    if (!dbData.events) {
      dbData.events = [];
    }

    const cleanDate = dateString || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    // Determine academic year
    let academicYear = "25/26";
    if (cleanDate.includes("2023") || cleanDate.includes("2024")) {
      academicYear = cleanDate.includes("Sep") || cleanDate.includes("Oct") || cleanDate.includes("Nov") || cleanDate.includes("Dec") 
        ? "24/25" : "23/24";
    }

    const newEvent = {
      id: 'event-' + Date.now(),
      pub: pubName.trim(),
      pint: pintName?.trim() || "Cask Ale",
      brewery: breweryName?.trim() || "Local Brewery",
      date: cleanDate,
      academicYear,
      score: null, // calculated dynamically from ratings
      ratingsCount: "0"
    };

    dbData.events.push(newEvent);

    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');

    return NextResponse.json({ success: true, event: newEvent });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
