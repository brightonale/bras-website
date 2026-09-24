import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cookieStore = await cookies();
    const voter = searchParams.get('voterName') || cookieStore.get('bras_user_name')?.value;
    if (!voter) {
      return NextResponse.json({ existingRating: null });
    }

    const cleanUsername = voter.toLowerCase().replace(/\s+/g, '');
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { name: cleanUsername },
          { name: voter },
          { votingName: voter }
        ]
      }
    });

    if (!user) {
      return NextResponse.json({ existingRating: null });
    }

    const activeSocial = await prisma.social.findFirst({
      where: { active: true }
    });

    if (!activeSocial) {
      return NextResponse.json({ existingRating: null });
    }

    const existingRating = await prisma.rating.findFirst({
      where: {
        userId: user.id,
        socialId: activeSocial.id
      }
    });

    return NextResponse.json({
      existingRating: existingRating ? {
        id: existingRating.id,
        score: existingRating.score,
        pubName: existingRating.pubName
      } : null
    });
  } catch (err) {
    console.error("API /rate GET error", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionUser = cookieStore.get('bras_user_name')?.value;

    const body = await req.json().catch(() => ({}));
    const { pubName, score, memberName } = body;

    const rawName = (typeof memberName === 'string' && memberName.trim())
      ? memberName.trim()
      : (sessionUser || '').trim();

    if (!rawName) {
      return NextResponse.json({ error: 'Unauthorized: Voter name required' }, { status: 401 });
    }

    if (!pubName || typeof score !== 'number' || isNaN(score) || score < 1 || score > 10) {
      return NextResponse.json({ error: 'Missing or invalid data' }, { status: 400 });
    }

    const cleanUsername = rawName.toLowerCase().replace(/\s+/g, '');
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { name: cleanUsername },
          { name: rawName },
          { votingName: rawName }
        ]
      }
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          name: cleanUsername || rawName,
          votingName: rawName,
          role: 'user',
          password: null,
          mustChange: false
        }
      });
    }

    // Check if there is an active social for this pub or active social overall
    const trimmedPub = pubName.trim();
    let social = await prisma.social.findFirst({
      where: { pubName: trimmedPub, active: true }
    });
    if (!social) {
      social = await prisma.social.findFirst({
        where: { active: true }
      });
    }

    // Deduplication: find existing rating for this active pint/social
    let existingRating = null;
    if (social) {
      existingRating = await prisma.rating.findFirst({
        where: {
          userId: dbUser.id,
          socialId: social.id
        }
      });
    }

    const finalPubName = social?.pubName || trimmedPub;
    const finalScore = Number(score.toFixed(2));
    let ratingRecord;
    if (existingRating) {
      ratingRecord = await prisma.rating.update({
        where: { id: existingRating.id },
        data: {
          score: finalScore,
          pubName: finalPubName,
          socialId: social ? social.id : existingRating.socialId,
          createdAt: new Date()
        }
      });
    } else {
      ratingRecord = await prisma.rating.create({
        data: {
          userId: dbUser.id,
          pubName: finalPubName,
          score: finalScore,
          socialId: social ? social.id : null
        }
      });
    }

    const response = NextResponse.json({
      success: true,
      rating: {
        id: ratingRecord.id,
        pubName: ratingRecord.pubName,
        score: ratingRecord.score,
        updated: !!existingRating
      }
    });

    // Set cookie so returning voters don't have to retype
    const oneYear = 60 * 60 * 24 * 365;
    response.cookies.set('bras_user_name', dbUser.name, {
      path: '/',
      maxAge: oneYear,
      sameSite: 'lax'
    });
    response.cookies.set('bras_voting_name', dbUser.votingName || rawName, {
      path: '/',
      maxAge: oneYear,
      sameSite: 'lax'
    });
    if (!cookieStore.get('bras_user_role')?.value) {
      response.cookies.set('bras_user_role', dbUser.role || 'user', {
        path: '/',
        maxAge: oneYear,
        sameSite: 'lax'
      });
    }

    return response;
  } catch (err) {
    console.error("API /rate error", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
