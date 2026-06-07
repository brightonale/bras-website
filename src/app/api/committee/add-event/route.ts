import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/app/actions';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (session.role !== 'committee') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pubName, pintName, breweryName, dateString } = await req.json();

    if (!pubName) {
      return NextResponse.json({ error: 'Missing pub name' }, { status: 400 });
    }

    const cleanDate = dateString || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    
    // Determine academic year
    let academicYear = "25/26";
    const d = new Date(cleanDate);
    if (!isNaN(d.getTime())) {
      const m = d.getMonth();
      const y = d.getFullYear();
      if (y === 2023) {
        academicYear = m >= 8 ? "23/24" : "22/23";
      } else if (y === 2024) {
        academicYear = m >= 8 ? "24/25" : "23/24";
      } else if (y === 2025) {
        academicYear = m >= 9 ? "25/26" : "24/25"; // October cutoff for 2025
      } else if (y === 2026) {
        academicYear = m >= 8 ? "26/27" : "25/26"; // September cutoff for 2026
      } else if (y >= 2027) {
        academicYear = m >= 8 ? `${y.toString().slice(-2)}/${(y + 1).toString().slice(-2)}` : `${(y - 1).toString().slice(-2)}/${y.toString().slice(-2)}`;
      }
    }

    // Create the social event in the database
    await prisma.social.create({
      data: {
        pubName: pubName.trim(),
        date: cleanDate,
        beerName: pintName?.trim() || "Cask Ale",
        breweryName: breweryName?.trim() || "Local Brewery",
        academicYear,
        active: false // Manual override logs don't automatically override the active scoring pint
      }
    });

    // Update pub status to Visited
    await prisma.pub.upsert({
      where: { name: pubName.trim() },
      update: { status: `Visited (${academicYear})` },
      create: { name: pubName.trim(), status: `Visited (${academicYear})` }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API add-event error", err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
