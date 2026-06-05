import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { memberName, pubName, score } = await req.json();

    if (!memberName || !pubName || typeof score !== 'number') {
      return NextResponse.json({ error: 'Missing or invalid data' }, { status: 400 });
    }

    const cleanName = memberName.toLowerCase().replace(/\s+/g, '');
    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { name: cleanName },
          { votingName: memberName }
        ]
      }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if there is an active social for this pub
    const social = await prisma.social.findFirst({
      where: { pubName: pubName.trim(), active: true }
    });

    // Create the rating
    await prisma.rating.create({
      data: {
        userId: dbUser.id,
        pubName: pubName.trim(),
        score: score,
        socialId: social ? social.id : null
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API /rate error", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
