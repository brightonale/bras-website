import { prisma } from '@/lib/db';
import LoginClient from './LoginClient';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  let allUsers: { name: string, votingName: string | null }[] = [];
  try {
    allUsers = await prisma.user.findMany({
      select: { name: true, votingName: true }
    });
  } catch (err) {
    console.error("Failed to fetch users", err);
  }
  
  // Transform to { name: string } format that the client expects
  const membersData = allUsers.map(u => ({
    name: u.votingName || u.name
  }));

  return <LoginClient initialMembers={membersData} />;
}
