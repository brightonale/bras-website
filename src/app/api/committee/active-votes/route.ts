import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/app/actions';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (session.role !== 'committee') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the currently active social
    const activeSocial = await prisma.social.findFirst({
      where: { active: true }
    });

    if (!activeSocial) {
      return NextResponse.json({
        success: true,
        activePint: null,
        totalVotes: 0,
        averageScore: null,
        votes: []
      });
    }

    // Retrieve all ratings for this active social
    const ratings = await prisma.rating.findMany({
      where: {
        socialId: activeSocial.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            votingName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const totalVotes = ratings.length;
    const averageScore = totalVotes > 0
      ? Number((ratings.reduce((acc, curr) => acc + curr.score, 0) / totalVotes).toFixed(2))
      : null;

    const formattedVotes = ratings.map(r => ({
      id: r.id,
      voterName: r.user?.votingName || r.user?.name || 'Anonymous',
      userId: r.userId,
      score: r.score,
      pubName: r.pubName,
      createdAt: r.createdAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      activePint: {
        id: activeSocial.id,
        pubName: activeSocial.pubName,
        beerName: activeSocial.beerName || 'Cask Ale',
        breweryName: activeSocial.breweryName || 'Local Brewery',
        dateString: activeSocial.date
      },
      totalVotes,
      averageScore,
      votes: formattedVotes
    });
  } catch (err) {
    console.error("API /committee/active-votes GET error", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (session.role !== 'committee') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    const ratingId = searchParams.get('id') || body.ratingId;

    if (!ratingId) {
      return NextResponse.json({ error: 'Rating ID is required' }, { status: 400 });
    }

    const activeSocial = await prisma.social.findFirst({
      where: { active: true }
    });

    const existing = await prisma.rating.findUnique({
      where: { id: ratingId }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Rating not found' }, { status: 404 });
    }

    // Protect historical ratings: Ensure the vote being deleted belongs to the active social
    if (activeSocial && existing.socialId !== activeSocial.id) {
      return NextResponse.json({ error: 'Vote does not belong to the active pint session' }, { status: 400 });
    }

    await prisma.rating.delete({
      where: { id: ratingId }
    });

    return NextResponse.json({
      success: true,
      message: 'Vote deleted successfully'
    });
  } catch (err) {
    console.error("API /committee/active-votes DELETE error", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
