const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runQA() {
  console.log("=== BRAS Full System QA Simulation (DB Level) ===");
  try {
    // 1. Registration Simulation
    console.log("Step 1: Register dummy account 'qa_user'");
    const existingUser = await prisma.user.findUnique({ where: { name: 'qa_user' } });
    if (existingUser) {
      await prisma.user.delete({ where: { name: 'qa_user' } });
    }
    const testUser = await prisma.user.create({
      data: {
        name: 'qa_user',
        password: 'password123',
        role: 'user', // default role, restricted
        mustChange: false
      }
    });
    console.log("Created user:", testUser.name, "with role:", testUser.role);

    // 2. Role Promotion
    console.log("\nStep 2: Promoting 'qa_user' to 'member'");
    const promotedUser = await prisma.user.update({
      where: { name: 'qa_user' },
      data: { role: 'member' }
    });
    console.log("User promoted. New role:", promotedUser.role);

    // 3. Wordle Simulation
    console.log("\nStep 3: Play Wordle and save score");
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const score = await prisma.wordleScore.create({
      data: {
        userId: promotedUser.id,
        score: 4, // 4 attempts
        date: today
      }
    });
    console.log("Saved Wordle Score:", score.score, "on", score.date);

    // 4. Create Active Social
    console.log("\nStep 4: Create active social event");
    const activeSocial = await prisma.social.create({
      data: {
        pubName: 'The QA Tavern',
        beerName: 'Test Ale',
        breweryName: 'QA Brewery',
        date: today,
        academicYear: '26/27',
        active: true
      }
    });
    console.log("Created Active Social:", activeSocial.pubName);

    // 5. Submit Rating
    console.log("\nStep 5: Submit rating for the active social");
    const rating = await prisma.rating.create({
      data: {
        score: 9.5,
        userId: promotedUser.id,
        pubName: activeSocial.pubName,
        socialId: activeSocial.id
      }
    });
    console.log("Submitted Rating:", rating.score, "stars");

    // 6. Custom HTML Page
    console.log("\nStep 6: Publish Custom HTML Page");
    const customPage = await prisma.customPage.create({
      data: {
        id: 'qa-test-page',
        title: 'QA Test Page',
        dateString: today,
        htmlContent: '<h1>QA Complete</h1><p>The system works perfectly.</p>'
      }
    });
    console.log("Created Custom Page:", customPage.title);

    // Clean up
    console.log("\nStep 7: Cleanup test data");
    await prisma.customPage.delete({ where: { id: 'qa-test-page' } });
    await prisma.rating.delete({ where: { id: rating.id } });
    await prisma.social.delete({ where: { id: activeSocial.id } });
    await prisma.wordleScore.delete({ where: { id: score.id } });
    await prisma.user.delete({ where: { name: 'qa_user' } });
    console.log("Cleanup complete.");

    console.log("\n=== QA Simulation Passed ===");
  } catch (err) {
    console.error("QA Simulation failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

runQA();
