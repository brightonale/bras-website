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
    if (cleanDate.includes("2023") || cleanDate.includes("2024")) {
      academicYear = cleanDate.includes("Sep") || cleanDate.includes("Oct") || cleanDate.includes("Nov") || cleanDate.includes("Dec") 
        ? "24/25" : "23/24";
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
