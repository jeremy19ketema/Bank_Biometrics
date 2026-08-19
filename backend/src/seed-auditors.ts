import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("auditor123", 10);
  
  // Create a global auditor (no branchId)
  const existingGlobalAuditor = await prisma.user.findFirst({
    where: { username: "auditor_global" }
  });

  if (!existingGlobalAuditor) {
    await prisma.user.create({
      data: {
        username: "auditor_global",
        fullName: "Global Systems Auditor",
        email: "auditor.global@bank.com",
        passwordHash,
        role: "AUDITOR",
        isActive: true,
        status: "ACTIVE",
        isFirstLogin: false
      }
    });
    console.log("Created Global Auditor: auditor_global");
  } else {
    console.log("Global Auditor already exists.");
  }

  // Ensure there's a branch to attach the scoped auditor to
  let testBranch = await prisma.branch.findFirst();
  if (!testBranch) {
    testBranch = await prisma.branch.create({
      data: {
        name: "Main HQ Branch",
        location: "Addis Ababa",
        branchCode: "HQ-001",
        status: "ACTIVE"
      }
    });
    console.log("Created Main HQ Branch");
  }

  // Create a branch-scoped auditor
  const existingScopedAuditor = await prisma.user.findFirst({
    where: { username: "auditor_scoped" }
  });

  if (!existingScopedAuditor) {
    await prisma.user.create({
      data: {
        username: "auditor_scoped",
        fullName: "HQ Branch Auditor",
        email: "auditor.hq@bank.com",
        passwordHash,
        role: "AUDITOR",
        branchId: testBranch.id,
        isActive: true,
        status: "ACTIVE",
        isFirstLogin: false
      }
    });
    console.log(`Created Scoped Auditor: auditor_scoped (Branch: ${testBranch.name})`);
  } else {
    console.log("Scoped Auditor already exists.");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
