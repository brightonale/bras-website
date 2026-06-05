import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/app/actions';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (session.role !== 'committee') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { word, hint } = await req.json();

    if (!word || word.length !== 5) {
      return NextResponse.json({ error: 'Word must be 5 letters' }, { status: 400 });
    }

    await prisma.settings.upsert({
      where: { id: 'global' },
      update: {
        wordleWord: Buffer.from(word.toUpperCase()).toString('base64'),
        wordleHint: hint || "A tasty pint."
      },
      create: {
        id: 'global',
        wordleWord: Buffer.from(word.toUpperCase()).toString('base64'),
        wordleHint: hint || "A tasty pint."
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Wordle API error", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
