import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const features = {
    leaderboard: true,
    checklist: true,
    matrix: true,
    wordle: true,
    awards: true,
    about: true,
    contact: true
  };

  try {
    const res = await prisma.settings.upsert({
      where: { id: 'global' },
      update: features,
      create: { id: 'global', ...features }
    });
    console.log("Upsert success:", res);
  } catch (e) {
    console.error("Upsert error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
