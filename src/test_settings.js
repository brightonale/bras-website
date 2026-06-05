const features = {
  leaderboard: true,
  checklist: true,
  matrix: true,
  wordle: true,
  awards: true,
  about: true,
  contact: true
};

async function run() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const res = await prisma.settings.upsert({
      where: { id: 'global' },
      update: features,
      create: { id: 'global', ...features }
    });
    console.log("Upsert:", res);
  } catch(e) {
    console.error("Prisma error:", e);
  }
}
run();
