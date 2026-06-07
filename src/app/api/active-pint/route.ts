import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/app/actions';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const activeSocial = await prisma.social.findFirst({
      where: { active: true }
    });

    return NextResponse.json({
      success: true,
      activePint: activeSocial ? {
        pubName: activeSocial.pubName,
        beerName: activeSocial.beerName || "Cask Ale",
        breweryName: activeSocial.breweryName || "Local Brewery",
        dateString: activeSocial.date
      } : null
    });
  } catch (err) {
    console.error("API /active-pint GET error", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Verify committee role from cookie session
    const session = await getSession();
    if (session.role !== 'committee') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pubName, beerName, breweryName, dateString } = await req.json();

    if (!pubName || !pubName.trim()) {
      // Clear active pint
      await prisma.social.updateMany({
        where: { active: true },
        data: { active: false }
      });
      return NextResponse.json({ success: true, activePint: null });
    }

    const cleanDate = dateString || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    
    // Determine academic year
    let academicYear = "25/26";
    if (cleanDate.includes("2023") || cleanDate.includes("2024")) {
      academicYear = cleanDate.includes("Sep") || cleanDate.includes("Oct") || cleanDate.includes("Nov") || cleanDate.includes("Dec") 
        ? "24/25" : "23/24";
    }

    // Find if a social already exists for this pub on this date
    let social = await prisma.social.findFirst({
      where: {
        pubName: pubName.trim(),
        date: cleanDate
      }
    });

    if (social) {
      social = await prisma.social.update({
        where: { id: social.id },
        data: {
          beerName: beerName?.trim() || "Cask Ale",
          breweryName: breweryName?.trim() || "Local Brewery",
          active: true
        }
      });
    } else {
      social = await prisma.social.create({
        data: {
          pubName: pubName.trim(),
          date: cleanDate,
          beerName: beerName?.trim() || "Cask Ale",
          breweryName: breweryName?.trim() || "Local Brewery",
          academicYear,
          active: true
        }
      });
    }

    // Deactivate other socials
    await prisma.social.updateMany({
      where: {
        id: { not: social.id },
        active: true
      },
      data: { active: false }
    });

    // Update pub status to Visited
    await prisma.pub.upsert({
      where: { name: pubName.trim() },
      update: { status: `Visited (${academicYear})` },
      create: { name: pubName.trim(), status: `Visited (${academicYear})` }
    });

    return NextResponse.json({
      success: true,
      activePint: {
        pubName: social.pubName,
        beerName: social.beerName,
        breweryName: social.breweryName,
        dateString: social.date
      }
    });
  } catch (err) {
    console.error("API /active-pint POST error", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
