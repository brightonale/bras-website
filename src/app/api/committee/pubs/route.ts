import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/app/actions';

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (session.role !== 'committee') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pubName, status } = await req.json();

    if (!pubName || !status) {
      return NextResponse.json({ error: 'Missing pubName or status' }, { status: 400 });
    }

    // Update the pub status
    const updatedPub = await prisma.pub.update({
      where: { name: pubName },
      data: { status }
    });

    return NextResponse.json({ success: true, pub: updatedPub });
  } catch (err) {
    console.error("API update pub status error", err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
