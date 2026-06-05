import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { password, word, hint } = await req.json();

    if (password !== process.env.NEXT_PUBLIC_COMMITTEE_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
