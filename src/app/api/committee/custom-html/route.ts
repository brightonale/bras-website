import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/app/actions';

export async function GET() {
  try {
    const session = await getSession();
    if (session.role !== 'committee') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pages = await prisma.customPage.findMany({
      select: { id: true, title: true }
    });
    
    // Map slug from the primary key id
    const mappedPages = pages.map(p => ({ slug: p.id, title: p.title }));
    
    return NextResponse.json({ pages: mappedPages });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (session.role !== 'committee') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, slug, dateString, htmlContent } = await req.json();

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

    return NextResponse.json({ success: true, page: { slug: safeSlug } });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

