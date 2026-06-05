import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src/data/db.json');

export async function GET() {
  try {
    let dbData = { events: [], newRatings: [] };
    if (fs.existsSync(dbPath)) {
      try {
        dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      } catch (e) {
        // fallback
      }
    }

    return NextResponse.json({
      success: true,
      events: dbData.events || [],
      newRatings: dbData.newRatings || []
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
