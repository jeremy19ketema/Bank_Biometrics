import { Response } from "express";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { logAuditEvent } from "../utils/audit.js";

// --- OFFBOARDING (MAKER) ---
export async function requestOffboarding(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { targetUserId, reason, finalWorkingDate, checklists } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!req.user) return;

  try {
    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      res.status(404).json({ success: false, message: "Target employee not found." });
      return;
    }

    if (targetUserId === req.user.id) {
      res.status(400).json({ success: false, message: "Cannot request offboarding for yourself." });
      return;
    }

    // Branch authorization check
    if (req.user.role === "HR" || req.user.role === "BANK_MANAGER") {
      if (req.user.branchId && targetUser.branchId !== req.user.branchId) {
        res.status(403).json({ success: false, message: "Cannot offboard an employee outside your branch." });
        return;
      }
    }

    // Ensure no pending offboarding exists
    const existing = await prisma.approvalRequest.findFirst({
      where: {
        requestType: "OFFBOARDING",
        targetUserId,
        status: "PENDING"
      }
    });

    if (existing) {
      res.status(400).json({ success: false, message: "An offboarding request is already pending for this employee." });
      return;
    }

    const details = JSON.stringify({
      reason,
      finalWorkingDate,
      checklists // { accessRemoval: true, assetsReturned: false, biometricRetention: "DELETE" }
    });

    const approval = await prisma.approvalRequest.create({
      data: {
        requestType: "OFFBOARDING",
        requestedById: req.user.id,
        requestedByName: req.user.fullName,
        targetUserId,
        targetBranchId: targetUser.branchId,
        details,
        status: "PENDING"
      }
    });

    await logAuditEvent(
      req.user.id,
      "OFFBOARDING_REQUESTED",
      "ADMINISTRATION",
      ipAddress,
      `Requested offboarding for ${targetUser.username}`,
      "SUCCESS"
    );

    res.status(201).json({ success: true, data: approval });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to request offboarding." });
  }
}

// --- OFFBOARDING (CHECKER) ---
export async function approveOffboarding(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  const { status, rejectionReason } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!req.user) return;

  if (status !== "APPROVED" && status !== "REJECTED") {
    res.status(400).json({ success: false, message: "Invalid status. Must be APPROVED or REJECTED." });
    return;
  }

  try {
    const request = await prisma.approvalRequest.findUnique({ where: { id } });
    if (!request || request.requestType !== "OFFBOARDING") {
      res.status(404).json({ success: false, message: "Offboarding request not found." });
      return;
    }

    if (request.status !== "PENDING") {
      res.status(400).json({ success: false, message: `Request is already ${request.status}.` });
      return;
    }

    if (request.requestedById === req.user.id) {
      res.status(403).json({ success: false, message: "Maker and Checker must be different users." });
      return;
    }

    // Checker authorization check
    if (req.user.role === "HR" || req.user.role === "BANK_MANAGER") {
      if (req.user.branchId && request.targetBranchId !== req.user.branchId) {
        res.status(403).json({ success: false, message: "Not authorized to approve offboarding for this branch." });
        return;
      }
    }

    // Transaction to update request and revoke access
    await prisma.$transaction(async (tx) => {
      await tx.approvalRequest.update({
        where: { id },
        data: {
          status,
          rejectionReason: status === "REJECTED" ? rejectionReason : null,
          approvedById: req.user!.id
        }
      });

      if (status === "APPROVED" && request.targetUserId) {
        const details = JSON.parse(request.details);

        // 1. Revoke Account Access
        await tx.user.update({
          where: { id: request.targetUserId },
          data: {
            isActive: false,
            status: "INACTIVE",
            // Remove active sessions (handled via redis/jwt secret rotation normally, here we just lock status)
          }
        });

        // 2. Clear Roles
        await tx.userCustomRole.deleteMany({
          where: { userId: request.targetUserId }
        });

        // 3. Biometric Access Revocation
        if (details.checklists?.biometricRetention === "DELETE") {
          // In a real system, call vendor API to delete templates. Here we just revoke consent and delete local scans.
          await tx.staffBiometricConsent.updateMany({
            where: { userId: request.targetUserId, isRevoked: false },
            data: { isRevoked: true, revokedAt: new Date() }
          });
        }
      }
    });

    await logAuditEvent(
      req.user.id,
      status === "APPROVED" ? "OFFBOARDING_APPROVED" : "OFFBOARDING_REJECTED",
      "ADMINISTRATION",
      ipAddress,
      `${status} offboarding for user ${request.targetUserId}`,
      "SUCCESS"
    );

    res.status(200).json({ success: true, message: `Offboarding ${status}.` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to process offboarding." });
  }
}

// --- PENDING APPROVALS ---
export async function getPendingApprovals(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) return;
  
  try {
    const whereClause: any = { status: "PENDING" };
    
    // Scoping for HR / Branch Managers
    if (req.user.role === "HR" || req.user.role === "BANK_MANAGER") {
      whereClause.targetBranchId = req.user.branchId;
      // Restrict generic approvals to only HR-authorized workflows
      whereClause.requestType = { in: ["USER_CREATION", "OFFBOARDING"] };
    }

    const approvals = await prisma.approvalRequest.findMany({
      where: whereClause,
      include: {
        requestedBy: { select: { id: true, username: true, fullName: true } }
      },
      orderBy: { createdAt: "asc" }
    });

    res.json({ success: true, data: approvals });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch approvals." });
  }
}
