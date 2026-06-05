import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src/data/db.json');

export async function GET() {
  try {
    let dbData = { activePint: null };
    if (fs.existsSync(dbPath)) {
      try {
        dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      } catch (e) {
        // fallback
      }
    }
    return NextResponse.json({ success: true, activePint: dbData.activePint || null });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { pubName, beerName, breweryName, dateString, role } = await request.json();

    if (role !== 'committee') {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    let dbData: any = { wordleWord: "MALTY", wordleHint: "", wordleScores: [], customPages: [], events: [], newRatings: [], activePint: null };
    if (fs.existsSync(dbPath)) {
      try {
        dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      } catch (e) {
        // fallback
      }
    }

    if (!pubName || !pubName.trim()) {
      // Clear active pint
      dbData.activePint = null;
    } else {
      const cleanDate = dateString || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      
      // Determine academic year
      let academicYear = "25/26";
      if (cleanDate.includes("2023") || cleanDate.includes("2024")) {
        academicYear = cleanDate.includes("Sep") || cleanDate.includes("Oct") || cleanDate.includes("Nov") || cleanDate.includes("Dec") 
          ? "24/25" : "23/24";
      }

      dbData.activePint = {
        pubName: pubName.trim(),
        beerName: beerName?.trim() || "Cask Ale",
        breweryName: breweryName?.trim() || "Local Brewery",
        dateString: cleanDate
      };

      // Also ensure this is logged as a Social event in events list if it doesn't exist
      if (!dbData.events) {
        dbData.events = [];
      }

      const exists = dbData.events.some((e: any) => 
        e.pub.toLowerCase() === pubName.trim().toLowerCase() && e.date === cleanDate
      );

      if (!exists) {
        const newEvent = {
          id: 'event-' + Date.now(),
          pub: pubName.trim(),
          pint: beerName?.trim() || "Cask Ale",
          brewery: breweryName?.trim() || "Local Brewery",
          date: cleanDate,
          academicYear,
          score: null,
          ratingsCount: "0"
        };
        dbData.events.push(newEvent);
      }
    }

    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');

    return NextResponse.json({ success: true, activePint: dbData.activePint });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
