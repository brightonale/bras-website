import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function main() {
  console.log("Starting historical data seed...");

  // 1. Ensure a historical consensus user exists
  const consensusUser = await prisma.user.upsert({
    where: { name: 'system_consensus' },
    update: {},
    create: {
      name: 'system_consensus',
      votingName: 'Consensus',
      password: 'historical_archive_bras',
      role: 'member'
    }
  });

  // 2. Retrieve pubs.json from git history (commit 4a03132)
  let pubsJsonRaw: string;
  try {
    pubsJsonRaw = execSync('git show 4a03132:src/data/pubs.json', { encoding: 'utf8' });
  } catch (err) {
    console.error("Failed to retrieve pubs.json from git history:", err);
    process.exit(1);
  }

  const pubs = JSON.parse(pubsJsonRaw);
  console.log(`Retrieved ${pubs.length} historical pubs from git history.`);

  // 3. Clear any existing historical ratings/socials to prevent duplicates if rerun
  // We only clear ratings associated with the system_consensus user
  await prisma.rating.deleteMany({
    where: { userId: consensusUser.id }
  });

  // 4. Seed the database
  let socialCount = 0;
  let ratingCount = 0;

  for (const entry of pubs) {
    const pubName = entry.pub.trim();
    const cleanDate = entry.date.trim();

    // Ensure Pub exists
    await prisma.pub.upsert({
      where: { name: pubName },
      update: {},
      create: {
        name: pubName,
        status: 'Visited',
        comment: null
      }
    });

    // Ensure Social exists
    let social = await prisma.social.findFirst({
      where: {
        pubName: pubName,
        date: cleanDate
      }
    });

    if (!social) {
      social = await prisma.social.create({
        data: {
          pubName: pubName,
          date: cleanDate,
          beerName: entry.pint || "Cask Ale",
          breweryName: entry.brewery || "Local Brewery",
          academicYear: entry.academicYear || "24/25",
          active: false
        }
      });
      socialCount++;
    } else {
      social = await prisma.social.update({
        where: { id: social.id },
        data: {
          beerName: entry.pint || social.beerName,
          breweryName: entry.brewery || social.breweryName
        }
      });
    }

    // Determine ratingsCount to seed
    let countToSeed = 1;
    if (entry.ratingsCount && entry.ratingsCount !== 'Consensus') {
      const parsed = parseInt(entry.ratingsCount);
      if (!isNaN(parsed) && parsed > 0) {
        countToSeed = parsed;
      }
    }

    // Insert ratings
    for (let c = 0; c < countToSeed; c++) {
      await prisma.rating.create({
        data: {
          userId: consensusUser.id,
          pubName: pubName,
          score: parseFloat(entry.score),
          socialId: social.id
        }
      });
      ratingCount++;
    }
  }

  console.log(`Seeding complete!`);
  console.log(`Added/Updated ${socialCount} Social events.`);
  console.log(`Created ${ratingCount} Rating records for the Consensus user.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
