import { prisma } from '@/lib/db';
import CommitteeClient from './CommitteeClient';

export default async function CommitteePage() {
  const allPubs = await prisma.pub.findMany();
  
  return <CommitteeClient initialPubs={allPubs} />;
}
