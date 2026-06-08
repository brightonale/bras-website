import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionUser = cookieStore.get('bras_user_name')?.value;
    
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pubName, score } = await req.json();

    if (!pubName || typeof score !== 'number') {
      return NextResponse.json({ error: 'Missing or invalid data' }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { name: sessionUser }
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
