import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { pub, date, password } = await req.json();

    if (password !== process.env.NEXT_PUBLIC_COMMITTEE_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!pub || !date) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    await prisma.social.create({
      data: {
        pubName: pub,
        date: date,
        academicYear: "25/26",
        active: true, // Auto set as active pint target
      }
    });

    // Deactivate other socials
    await prisma.social.updateMany({
      where: {
        pubName: { not: pub },
        active: true
      },
      data: { active: false }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API add-event error", err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
