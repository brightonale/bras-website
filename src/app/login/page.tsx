import { prisma } from '@/lib/db';
import LoginClient from './LoginClient';

export default async function LoginPage() {
  const allUsers = await prisma.user.findMany({
    select: { name: true, votingName: true }
  });
  
  // Transform to { name: string } format that the client expects
  const membersData = allUsers.map(u => ({
    name: u.votingName || u.name
  }));

  return <LoginClient initialMembers={membersData} />;
}
