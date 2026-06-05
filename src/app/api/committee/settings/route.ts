import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/app/actions';

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 'global' } });
    
    if (!settings) {
      return NextResponse.json({ features: {} });
    }

    // Convert boolean settings to a features object that the frontend expects
    const features = {
      leaderboard: settings.leaderboard,
      checklist: settings.checklist,
      matrix: settings.matrix,
      wordle: settings.wordle,
      awards: settings.awards,
      about: settings.about,
      contact: settings.contact
    };

    return NextResponse.json({ features });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (session.role !== 'committee') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { features } = await req.json();

    await prisma.settings.upsert({
      where: { id: 'global' },
      update: features,
      create: { id: 'global', ...features }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Settings API error", err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
