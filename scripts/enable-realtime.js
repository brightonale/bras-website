const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function enableRealtime() {
  console.log("Enabling Supabase Realtime on 'Rating' table...");
  try {
    // Check if publication 'supabase_realtime' exists
    const pubCheck = await prisma.$queryRaw`SELECT pubname FROM pg_publication WHERE pubname = 'supabase_realtime';`;
    
    if (pubCheck.length === 0) {
      console.log("Creating publication 'supabase_realtime'...");
      await prisma.$executeRawUnsafe(`CREATE PUBLICATION supabase_realtime FOR TABLE "Rating";`);
    } else {
      console.log("Adding 'Rating' to existing publication 'supabase_realtime'...");
      await prisma.$executeRawUnsafe(`ALTER PUBLICATION supabase_realtime ADD TABLE "Rating";`);
    }
    
    console.log("Realtime enabled successfully for Rating!");
  } catch (err) {
    // If it's already added, it throws an error which we can ignore
    if (err.message.includes("already in publication")) {
      console.log("'Rating' table is already enabled for realtime.");
    } else {
      console.error("Failed to enable realtime:", err.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

enableRealtime();
