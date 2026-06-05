import { prisma } from '../lib/db';

async function main() {
  const users = await prisma.user.count();
  const socials = await prisma.social.count();
  const ratings = await prisma.rating.count();
  const wordleScores = await prisma.wordleScore.count();
  const customPages = await prisma.customPage.count();
  const settings = await prisma.settings.count();
  const pubs = await prisma.pub.count();

  console.log({
    users,
    socials,
    ratings,
    wordleScores,
    customPages,
    settings,
    pubs
  });

  const allSettings = await prisma.settings.findMany();
  console.log('Settings:', allSettings);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
