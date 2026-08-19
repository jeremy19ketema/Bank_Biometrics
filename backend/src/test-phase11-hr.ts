import { PrismaClient } from "@prisma/client";
import { requestOffboarding, approveOffboarding } from "./controllers/hrController.js";
import { assignCompliance, verifyCompliance } from "./controllers/complianceController.js";
import { Request, Response } from "express";

const prisma = new PrismaClient();

class MockRes {
  statusCode: number = 200;
  body: any;
  status(code: number) { this.statusCode = code; return this; }
  json(data: any) { this.body = data; return this; }
}

async function runTest() {
  console.log("=== Phase 11 HR Module Verification ===");

  const globalAdmin = await prisma.user.findFirst({ where: { username: "superadmin_real" } });
  const hrUser = await prisma.user.findFirst({ where: { role: "HR" } });
  const targetUser = await prisma.user.findFirst({ where: { role: "BANK_MANAGER" } });
  const course = await prisma.complianceCourse.findFirst();

  if (!globalAdmin || !hrUser || !targetUser || !course) {
    console.log("Missing test data. Test skipped.");
    return;
  }

  // 1. Assign Compliance
  console.log("\\nAssigning Compliance...");
  const assignReq = { user: hrUser, body: { targetUserId: targetUser.id, courseId: course.id, dueDate: new Date() }, ip: "127.0.0.1" } as unknown as Request;
  const assignRes = new MockRes();
  await assignCompliance(assignReq, assignRes as unknown as Response);
  console.log("Assign Response:", assignRes.body);

  const recordId = assignRes.body?.data?.id;

  // 2. Verify Compliance
  if (recordId) {
    console.log("\\nVerifying Compliance...");
    const verifyReq = { user: globalAdmin, params: { id: recordId }, body: { status: "COMPLETED" }, ip: "127.0.0.1" } as unknown as Request;
    const verifyRes = new MockRes();
    await verifyCompliance(verifyReq, verifyRes as unknown as Response);
    console.log("Verify Response:", verifyRes.body);
  }

  // 3. Request Offboarding
  console.log("\\nRequesting Offboarding...");
  const offReq = { 
    user: hrUser, 
    body: { targetUserId: targetUser.id, reason: "Test Offboarding", finalWorkingDate: new Date(), checklists: { biometricRetention: "DELETE" } }, 
    ip: "127.0.0.1" 
  } as unknown as Request;
  const offRes = new MockRes();
  await requestOffboarding(offReq, offRes as unknown as Response);
  console.log("Offboard Request Response:", offRes.body);

  const approvalId = offRes.body?.data?.id;

  // 4. Approve Offboarding (Checker must be different)
  if (approvalId) {
    console.log("\\nApproving Offboarding (Maker-Checker)...");
    const appReq = { user: globalAdmin, params: { id: approvalId }, body: { status: "APPROVED" }, ip: "127.0.0.1" } as unknown as Request;
    const appRes = new MockRes();
    await approveOffboarding(appReq, appRes as unknown as Response);
    console.log("Approve Response:", appRes.body);

    const checkUser = await prisma.user.findUnique({ where: { id: targetUser.id } });
    console.log("Target User Active Status post-offboarding:", checkUser?.isActive);
  }
  
  console.log("\\n✅ Phase 11 HR Tests Completed!");
}

runTest().catch(console.error).finally(() => prisma.$disconnect());
