import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 'global' } });
    if (!settings) {
      return NextResponse.json({ wordB64: Buffer.from("STOUT").toString('base64'), hint: "A dark beer" });
    }
    return NextResponse.json({ wordB64: settings.wordleWord, hint: settings.wordleHint });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, score } = await req.json();

    if (!user || typeof score !== 'number') {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const usernameKey = user.toLowerCase().replace(/\s+/g, '');
    const dbUser = await prisma.user.findUnique({ where: { name: usernameKey } });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get today's date string e.g. "2026-06-05"
    const todayStr = new Date().toISOString().split('T')[0];

    // Upsert so they can only submit once per day, or update their score
    const existingScore = await prisma.wordleScore.findFirst({
      where: {
        userId: dbUser.id,
        date: todayStr
      }
    });

    if (existingScore) {
      await prisma.wordleScore.update({
        where: { id: existingScore.id },
        data: { score }
      });
    } else {
      await prisma.wordleScore.create({
        data: {
          userId: dbUser.id,
          date: todayStr,
          score
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
