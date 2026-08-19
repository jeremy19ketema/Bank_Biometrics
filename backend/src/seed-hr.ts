import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("Seeding is disabled in production.");
    process.exit(1);
  }
  console.log("Seeding HR demo data...");
  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Create a dummy Branch
  const hqBranch = await prisma.branch.upsert({
    where: { code: 'HQ' },
    update: {},
    create: { name: 'Headquarters', code: 'HQ', city: 'Metropolis', address: '123 Main St', phone: '555-0100', email: 'hq@bank.com', status: 'ACTIVE', dailyTransactionLimit: 1000000 }
  });

  // 2. Create HR User
  const hrUser = await prisma.user.upsert({
    where: { username: "hr_admin" },
    update: {},
    create: {
      username: "hr_admin",
      fullName: "HR Administrator",
      email: "hr@bank.com",
      passwordHash,
      role: "HR",
      isActive: true,
      status: "ACTIVE",
      isFirstLogin: false,
      branchId: hqBranch.id
    }
  });

  // 3. Create a Bank Manager
  const managerUser = await prisma.user.upsert({
    where: { username: "hq_manager" },
    update: {},
    create: {
      username: "hq_manager",
      fullName: "HQ Manager",
      email: "manager@bank.com",
      passwordHash,
      role: "BANK_MANAGER",
      isActive: true,
      status: "ACTIVE",
      isFirstLogin: false,
      branchId: hqBranch.id
    }
  });

  // 4. Create an Employee
  const emp1 = await prisma.user.upsert({
    where: { username: "john_teller" },
    update: {},
    create: {
      username: "john_teller",
      fullName: "John Teller",
      email: "john@bank.com",
      passwordHash,
      role: "ACCOUNTANT",
      isActive: true,
      status: "ACTIVE",
      isFirstLogin: false,
      branchId: hqBranch.id
    }
  });

  // 4.5 Create a Device
  const device = await prisma.biometricDevice.upsert({
    where: { id: "TERM-01" },
    update: {},
    create: {
      id: "TERM-01",
      name: "Main Entrance Terminal",
      status: "ONLINE",
      branchId: hqBranch.id,
      macAddress: "00:11:22:33:44:55",
      secretKeyHash: passwordHash
    }
  });

  // 5. Seed Attendance Events
  await prisma.attendanceEvent.createMany({
    data: [
      { userId: emp1.id, type: "IN", deviceTimestamp: new Date(), deviceId: "TERM-01", deviceEventId: "IN-" + Date.now() },
      { userId: emp1.id, type: "OUT", deviceTimestamp: new Date(Date.now() + 8*3600*1000), deviceId: "TERM-01", deviceEventId: "OUT-" + Date.now() }
    ],
    skipDuplicates: true
  });

  // 6. Seed Leave and Overtime Requests
  const pendingLeave = await prisma.leaveRequest.findFirst({ where: { userId: emp1.id } });
  if (!pendingLeave) {
    await prisma.leaveRequest.create({
      data: {
        userId: emp1.id,
        type: "ANNUAL",
        startDate: new Date(),
        endDate: new Date(Date.now() + 5*24*3600*1000),
        reason: "Family vacation",
        status: "PENDING"
      }
    });
  }

  const pendingOvertime = await prisma.overtimeRequest.findFirst({ where: { userId: emp1.id } });
  if (!pendingOvertime) {
    await prisma.overtimeRequest.create({
      data: {
        userId: emp1.id,
        date: new Date(),
        hours: 4,
        reason: "End of month reconciliation",
        status: "PENDING"
      }
    });
  }

  // 7. Seed Compliance Course
  const course = await prisma.complianceCourse.upsert({
    where: { code: 'AML-101' },
    update: {},
    create: {
      title: 'Anti-Money Laundering Basics',
      code: 'AML-101',
      category: 'REGULATORY',
      validityMonths: 12,
      isActive: true
    }
  });

  // 8. Assign Course to Employee
  const complianceRecord = await prisma.staffComplianceRecord.findFirst({ where: { userId: emp1.id, courseId: course.id } });
  if (!complianceRecord) {
    await prisma.staffComplianceRecord.create({
      data: {
        userId: emp1.id,
        courseId: course.id,
        dueDate: new Date(Date.now() + 30*24*3600*1000),
        status: "PENDING"
      }
    });
  }

  // 9. Seed pending approvals (Onboarding and Offboarding)
  const existingApprovals = await prisma.approvalRequest.findFirst({ where: { targetUserId: emp1.id, requestType: "OFFBOARDING" } });
  if (!existingApprovals) {
    await prisma.approvalRequest.create({
      data: {
        requestType: "OFFBOARDING",
        requestedById: managerUser.id,
        requestedByName: managerUser.fullName,
        targetUserId: emp1.id,
        targetBranchId: hqBranch.id,
        status: "PENDING",
        details: JSON.stringify({ reason: "Resignation", finalWorkingDate: "2026-10-01" })
      }
    });
  }

  console.log("HR Demo Data Seeded Successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
