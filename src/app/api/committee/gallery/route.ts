import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/app/actions';

/**
 * GET: Return socials from the database.
 * - Default: only socials with a coverPhotoUrl set (for the public gallery).
 * - ?all=true: return ALL socials (used by the committee dashboard dropdown).
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const showAll = searchParams.get('all') === 'true';

    const socials = await prisma.social.findMany({
      where: showAll ? {} : { coverPhotoUrl: { not: null } },
      orderBy: { date: 'desc' },
      select: {
        id: true,
        pubName: true,
        beerName: true,
        breweryName: true,
        date: true,
        coverPhotoUrl: true,
        academicYear: true
      }
    });
    return NextResponse.json({ socials });
  } catch (err) {
    console.error('Gallery API error', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST: Update a Social's coverPhotoUrl (committee only).
 * Body: { socialId: string, coverPhotoUrl: string | null }
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (session.role !== 'committee') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { socialId, coverPhotoUrl } = await req.json();
    if (!socialId) {
      return NextResponse.json({ error: 'Social ID is required' }, { status: 400 });
    }

    const updated = await prisma.social.update({
      where: { id: socialId },
      data: { coverPhotoUrl: coverPhotoUrl || null }
    });

    return NextResponse.json({ success: true, social: updated });
  } catch (err) {
    console.error('Gallery API error', err);
    return NextResponse.json({ error: (err as Error).message || 'Internal Server Error' }, { status: 500 });
  }
}
