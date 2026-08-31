import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.create({
      data: {
        username: "test_it_user_" + Date.now(),
        fullName: "Test IT User",
        email: "test_it_" + Date.now() + "@test.com",
        passwordHash: "dummyhash",
        role: "SUPER_ADMIN_IT",
        branchId: null,
        department: "Biometric Systems",
        isActive: true,
        status: "ACTIVE",
        isFirstLogin: true
      }
    });
    console.log("Successfully created user!", user.id);
  } catch (e) {
    console.error("Failed to create user:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
