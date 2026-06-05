import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log("Starting migration...");

  // 1. Settings
  try {
    const settingsPath = path.join(process.cwd(), 'src/data/settings.json');
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    await prisma.settings.create({
      data: {
        id: "global",
        ...settings.features,
      }
    });
    console.log("Settings migrated.");
  } catch (e) {
    console.log("Settings migration failed or missing:", e);
  }

  // 2. Pubs
  try {
    const pubsPath = path.join(process.cwd(), 'src/data/pubs.json');
    const pubs = JSON.parse(fs.readFileSync(pubsPath, 'utf8'));
    for (const pub of pubs) {
      await prisma.pub.upsert({
        where: { name: pub.pub },
        update: {},
        create: {
          name: pub.pub,
          status: pub.visited ? "Visited" : "Not Visited",
          comment: pub.comment || null
        }
      });
    }
    console.log("Pubs migrated.");
  } catch (e) {
    console.log("Pubs migration failed:", e);
  }

  // 3. Users and Ratings (from db.json and members.json)
  try {
    const membersPath = path.join(process.cwd(), 'src/data/members.json');
    const members = JSON.parse(fs.readFileSync(membersPath, 'utf8'));
    
    // Create users
    for (const member of members) {
      const usernameKey = member.name.toLowerCase().replace(/\s+/g, '');
      await prisma.user.upsert({
        where: { name: usernameKey },
        update: {},
        create: {
          name: usernameKey,
          votingName: member.name,
          role: "committee", // Everyone is committee now
          password: "bras" + new Date().getFullYear(),
        }
      });
    }
    console.log("Users migrated.");

    // Migrate ratings from db.json
    const dbPath = path.join(process.cwd(), 'src/data/db.json');
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    if (db.newRatings) {
      for (const r of db.newRatings) {
        const usernameKey = r.member.toLowerCase().replace(/\s+/g, '');
        // make sure user exists
        const user = await prisma.user.findUnique({ where: { name: usernameKey } });
        if (user) {
          await prisma.rating.create({
            data: {
              userId: user.id,
              pubName: r.pub,
              score: r.score,
            }
          });
        }
      }
    }
    console.log("Ratings migrated.");

  } catch (e) {
    console.log("Users/Ratings migration failed:", e);
  }

  // 4. Socials (from timeline.json)
  try {
    const timelinePath = path.join(process.cwd(), 'src/data/timeline.json');
    const timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf8'));
    for (const event of timeline) {
      await prisma.social.create({
        data: {
          date: event.date,
          pubName: event.pub,
          academicYear: "2025/2026",
          active: false,
        }
      });
    }
    console.log("Socials migrated.");
  } catch (e) {
    console.log("Socials migration failed:", e);
  }

  console.log("Migration complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
