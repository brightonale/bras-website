import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetPasswords() {
  console.log("Resetting all passwords...");
  const result = await prisma.user.updateMany({
    data: {
      password: "BrasCommittee2026!",
      mustChange: true
    }
  });
  console.log(`Successfully reset passwords for ${result.count} users.`);
}

resetPasswords()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
