import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const activeSocial = await prisma.social.findFirst({
      where: { active: true }
    });

    if (!activeSocial) {
      return NextResponse.json({ pub: null, ratings: [] });
    }

    const ratings = await prisma.rating.findMany({
      where: { socialId: activeSocial.id },
      include: { user: true }
    });

    return NextResponse.json({
      pub: activeSocial.pubName,
      ratings: ratings.map(r => ({
        member: r.user.votingName || r.user.name,
        score: r.score
      }))
    });
  } catch (err) {
    console.error("API /active-pint error", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
