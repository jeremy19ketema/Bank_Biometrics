import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findUnique({
    where: { username: "hr_admin" }
  });
  console.log("Found user:", user);
}

check().catch(console.error).finally(() => prisma.$disconnect());
