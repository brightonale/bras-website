import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getAcademicYear(dateString: string) {
  if (dateString === "2023/24") return "23/24";
  if (dateString === "2024/25") return "24/25";
  if (dateString === "2025/26") return "25/26";

  let academicYear = "25/26";
  const d = new Date(dateString);
  if (!isNaN(d.getTime())) {
    const m = d.getMonth();
    const y = d.getFullYear();
    if (y === 2023) {
      academicYear = m >= 8 ? "23/24" : "22/23";
    } else if (y === 2024) {
      academicYear = m >= 8 ? "24/25" : "23/24";
    } else if (y === 2025) {
      academicYear = m >= 9 ? "25/26" : "24/25"; // October cutoff for 2025
    } else if (y === 2026) {
      academicYear = m >= 8 ? "26/27" : "25/26"; // September cutoff for 2026
    } else if (y >= 2027) {
      academicYear = m >= 8 ? `${y.toString().slice(-2)}/${(y + 1).toString().slice(-2)}` : `${(y - 1).toString().slice(-2)}/${y.toString().slice(-2)}`;
    }
  }
  return academicYear;
}

async function main() {
  const socials = await prisma.social.findMany();
  let updatedCount = 0;
  for (const social of socials) {
    const expected = getAcademicYear(social.date);
    if (social.academicYear !== expected) {
      await prisma.social.update({
        where: { id: social.id },
        data: { academicYear: expected }
      });
      console.log(`Updated ${social.pubName} (${social.date}): ${social.academicYear} -> ${expected}`);
      updatedCount++;
    }
  }
  console.log(`Finished updating ${updatedCount} socials.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
