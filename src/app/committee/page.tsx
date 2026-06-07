import { prisma } from '@/lib/db';
import CommitteeClient from './CommitteeClient';

export const dynamic = 'force-dynamic';

export default async function CommitteePage() {
  let allPubs: { name: string, status: string, comment: string | null }[] = [];
  try {
    allPubs = await prisma.pub.findMany();
  } catch (err) {
    console.error("Failed to fetch pubs", err);
  }
  
  return <CommitteeClient initialPubs={allPubs} />;
}
