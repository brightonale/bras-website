import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 'global' } });
    return NextResponse.json(settings || {});
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { password, features } = await req.json();

    if (password !== process.env.NEXT_PUBLIC_COMMITTEE_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.settings.upsert({
      where: { id: 'global' },
      update: features,
      create: { id: 'global', ...features }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
