/* eslint-disable */
import Database from 'better-sqlite3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const db = new Database('./prisma/dev.db', { readonly: true });

async function migrate() {
  console.log("Starting data migration from SQLite to Postgres...");

  // Users
  const users = db.prepare('SELECT * FROM User').all() as any[];
  console.log(`Migrating ${users.length} users...`);
  for (const u of users) {
    try {
      const data = { ...u, mustChange: u.mustChange === 1 };
      await prisma.user.upsert({
        where: { id: u.id },
        update: data,
        create: data
      });
    } catch(e) { console.error("Error inserting user:", u.name, e); }
  }

  // Settings
  const settings = db.prepare('SELECT * FROM Settings').all() as any[];
  console.log(`Migrating ${settings.length} settings...`);
  for (const s of settings) {
    try {
      const data = {
        leaderboard: s.leaderboard === 1,
        checklist: s.checklist === 1,
        matrix: s.matrix === 1,
        wordle: s.wordle === 1,
        awards: s.awards === 1,
        about: s.about === 1,
        contact: s.contact === 1,
        wordleWord: s.wordleWord,
        wordleHint: s.wordleHint
      };
      await prisma.settings.upsert({
        where: { id: s.id },
        update: data,
        create: { id: s.id, ...data }
      });
    } catch(e) { console.error("Error inserting settings", e); }
  }

  // Pubs
  const pubs = db.prepare('SELECT * FROM Pub').all() as any[];
  console.log(`Migrating ${pubs.length} pubs...`);
  for (const p of pubs) {
    try {
        await prisma.pub.upsert({
            where: { name: p.name },
            update: p,
            create: p
        });
    } catch(e){}
  }

  // Socials
  const socials = db.prepare('SELECT * FROM Social').all() as any[];
  console.log(`Migrating ${socials.length} socials...`);
  for (const s of socials) {
    try {
      const data = {
        ...s,
        active: s.active === 1
      };
      await prisma.social.upsert({
        where: { id: s.id },
        update: data,
        create: data
      });
    } catch(e) { console.error("Error inserting social", e); }
  }

  // Ratings
  const ratings = db.prepare('SELECT * FROM Rating').all() as any[];
  console.log(`Migrating ${ratings.length} ratings...`);
  for (const r of ratings) {
    try {
      const data = {
        ...r,
        createdAt: new Date(r.createdAt)
      };
      await prisma.rating.upsert({
        where: { id: r.id },
        update: data,
        create: data
      });
    } catch(e) { console.error("Error inserting rating", e); }
  }

  // WordleScores
  const wordles = db.prepare('SELECT * FROM WordleScore').all() as any[];
  console.log(`Migrating ${wordles.length} WordleScores...`);
  for (const w of wordles) {
    try {
      const data = {
        ...w,
        timestamp: new Date(w.timestamp)
      };
      await prisma.wordleScore.upsert({
        where: { id: w.id },
        update: data,
        create: data
      });
    } catch(e) {}
  }

  // CustomPages
  const pages = db.prepare('SELECT * FROM CustomPage').all() as any[];
  console.log(`Migrating ${pages.length} CustomPages...`);
  for (const p of pages) {
    try {
      const data = {
        ...p,
        createdAt: new Date(p.createdAt)
      };
      await prisma.customPage.upsert({
        where: { id: p.id },
        update: data,
        create: data
      });
    } catch(e) {}
  }

  console.log("Migration complete!");
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
