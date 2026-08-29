import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_email_key";`);
    console.log("Successfully dropped User_email_key constraint.");
  } catch (error) {
    console.error("Error dropping constraint:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
