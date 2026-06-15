const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRatings() {
  const ratings = await prisma.rating.findMany({
    include: { social: true }
  });
  
  const socialScores = {};
  for (const r of ratings) {
    if (!r.socialId) continue;
    if (!socialScores[r.socialId]) socialScores[r.socialId] = { pub: r.pubName, beer: r.social?.beerName, sum: 0, count: 0 };
    socialScores[r.socialId].sum += r.score;
    socialScores[r.socialId].count += 1;
  }
  
  console.log("=== Rating Averages ===");
  for (const id in socialScores) {
    const s = socialScores[id];
    console.log(`${s.pub} - ${s.beer}: ${(s.sum / s.count).toFixed(2)} (${s.count} ratings)`);
  }

  await prisma.$disconnect();
}

checkRatings();
