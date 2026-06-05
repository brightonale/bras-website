import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { password, title, slug, dateString, htmlContent } = await req.json();

    if (password !== process.env.NEXT_PUBLIC_COMMITTEE_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!title || !slug || !htmlContent) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    await prisma.customPage.upsert({
      where: { id: safeSlug },
      update: {
        title,
        dateString: dateString || new Date().toISOString().split('T')[0],
        htmlContent
      },
      create: {
        id: safeSlug,
        title,
        dateString: dateString || new Date().toISOString().split('T')[0],
        htmlContent
      }
    });

    return NextResponse.json({ success: true, slug: safeSlug });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
