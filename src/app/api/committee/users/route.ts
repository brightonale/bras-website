import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/app/actions';

export async function GET() {
  try {
    const session = await getSession();
    if (session.role !== 'committee') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        name: true,
        votingName: true,
        role: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Format to a key-value dictionary that matches what the dashboard client expects
    const userDict: Record<string, { votingName: string; role: string }> = {};
    users.forEach(u => {
      userDict[u.name] = {
        votingName: u.votingName || u.name,
        role: u.role
      };
    });

    return NextResponse.json({ users: userDict });
  } catch (err) {
    console.error("API get users error", err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (session.role !== 'committee') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username, role } = await req.json();

    if (!username || !role) {
      return NextResponse.json({ error: 'Missing username or role' }, { status: 400 });
    }

    const cleanUsername = username.toLowerCase().replace(/\s+/g, '');

    // Prevent self-demotion
    if (cleanUsername === session.name && role !== 'committee') {
      return NextResponse.json({ error: 'You cannot revoke your own committee role.' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { name: cleanUsername },
      data: { role }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("API post user error", err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
