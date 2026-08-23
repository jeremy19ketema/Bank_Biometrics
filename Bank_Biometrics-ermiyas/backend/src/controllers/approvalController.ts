import { Response } from "express";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest, UserRole } from "../middleware/auth.js";
import { logAuditEvent } from "../utils/audit.js";

const UNRESTRICTED_ROLES: UserRole[] = ["SUPER_ADMIN", "SUPER_ADMIN_MANAGER", "SUPER_ADMIN_IT", "SUPER_ADMIN_FOREX"];

// Authorization: Bank Managers / Branch IT may only action requests that
// target their own branch. HR and other roles cannot approve anything.
function canActionApproval(user: NonNullable<AuthenticatedRequest["user"]>, targetBranchId: string | null): boolean {
  if (UNRESTRICTED_ROLES.includes(user.role)) {
    return true;
  }
  if (user.role === "BANK_MANAGER" || user.role === "BRANCH_IT") {
    return !!targetBranchId && targetBranchId === user.branchId;
  }
  return false;
}

// Get all pending approval requests (Super Admin sees all, Bank Manager sees branch-level)
export async function getPendingApprovals(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { role, branchId } = req.user;

    let whereClause: any = { status: "PENDING" };

    // Bank Manager only sees branch-level requests
    if (role === "BANK_MANAGER") {
      whereClause.targetBranchId = branchId;
    }

    // Branch IT sees their branch requests
    if (role === "BRANCH_IT") {
      whereClause.targetBranchId = branchId;
    }

    const approvals = await prisma.approvalRequest.findMany({
      where: whereClause,
      include: {
        requestedBy: {
          select: { id: true, fullName: true, username: true, role: true }
        },
        approvedBy: {
          select: { id: true, fullName: true, username: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.status(200).json({ success: true, data: approvals });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve approval requests" });
  }
}

// Get all approval requests (with filters)
export async function getAllApprovals(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { status } = req.query;

    let whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    const approvals = await prisma.approvalRequest.findMany({
      where: whereClause,
      include: {
        requestedBy: {
          select: { id: true, fullName: true, username: true, role: true }
        },
        approvedBy: {
          select: { id: true, fullName: true, username: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.status(200).json({ success: true, data: approvals });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve approval requests" });
  }
}

// Create an approval request
export async function createApprovalRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { requestType, targetUserId, targetRole, targetBranchId, details } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  if (!requestType || !details) {
    res.status(400).json({ success: false, message: "Request type and details are required" });
    return;
  }

  try {
    const approval = await prisma.approvalRequest.create({
      data: {
        requestType,
        requestedById: req.user.id,
        requestedByName: req.user.username,
        targetUserId: targetUserId || null,
        targetRole: targetRole || null,
        targetBranchId: targetBranchId || null,
        details,
        status: "PENDING"
      }
    });

    await logAuditEvent(req.user.id, "APPROVAL_REQUEST_CREATED", "ADMINISTRATION", ipAddress, `Approval request created: ${requestType} - ${details}`, "SUCCESS");

    res.status(201).json({ success: true, data: approval });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create approval request" });
  }
}

// Approve an approval request
export async function approveRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = String(req.params.id);
  const ipAddress = req.ip || "unknown";

  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  try {
    const approval = await prisma.approvalRequest.findUnique({
      where: { id }
    });

    if (!approval) {
      res.status(404).json({ success: false, message: "Approval request not found" });
      return;
    }

    if (approval.status !== "PENDING") {
      res.status(400).json({ success: false, message: `Request already ${approval.status.toLowerCase()}` });
      return;
    }

    if (!canActionApproval(req.user, approval.targetBranchId)) {
      res.status(403).json({ success: false, message: "Access denied: you can only approve requests for your assigned branch" });
      return;
    }

    // Update the approval request
    const updated = await prisma.approvalRequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedById: req.user.id
      }
    });

    // If the request was about a user, update their status
    if (approval.targetUserId) {
      if (approval.requestType === "CREATE_BANK_MANAGER" || approval.requestType === "CREATE_ACCOUNTANT" || approval.requestType === "CREATE_BRANCH_IT") {
        await prisma.user.update({
          where: { id: approval.targetUserId },
          data: {
            status: "PENDING_FIRST_LOGIN",
            isActive: true,
            isFirstLogin: true
          }
        });
      } else if (approval.requestType === "ACTIVATE_USER") {
        await prisma.user.update({
          where: { id: approval.targetUserId },
          data: { status: "ACTIVE", isActive: true }
        });
      } else if (approval.requestType === "SUSPEND_USER") {
        await prisma.user.update({
          where: { id: approval.targetUserId },
          data: { status: "SUSPENDED", isActive: false }
        });
      } else if (approval.requestType === "DISABLE_USER") {
        await prisma.user.update({
          where: { id: approval.targetUserId },
          data: { status: "DISABLED", isActive: false }
        });
      }
    }

    await logAuditEvent(req.user.id, "APPROVAL_REQUEST_APPROVED", "ADMINISTRATION", ipAddress, `Approved request: ${approval.requestType} - ${approval.details}`, "SUCCESS");

    res.status(200).json({ success: true, data: updated, message: "Request approved successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to approve request" });
  }
}

// Reject an approval request
export async function rejectRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = String(req.params.id);
  const { rejectionReason } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  try {
    const approval = await prisma.approvalRequest.findUnique({
      where: { id }
    });

    if (!approval) {
      res.status(404).json({ success: false, message: "Approval request not found" });
      return;
    }

    if (approval.status !== "PENDING") {
      res.status(400).json({ success: false, message: `Request already ${approval.status.toLowerCase()}` });
      return;
    }

    if (!canActionApproval(req.user, approval.targetBranchId)) {
      res.status(403).json({ success: false, message: "Access denied: you can only reject requests for your assigned branch" });
      return;
    }

    const updated = await prisma.approvalRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        approvedById: req.user.id,
        rejectionReason: rejectionReason || "No reason provided"
      }
    });

    // Only creation requests leave an orphaned user behind — deactivate it.
    // Rejecting a SUSPEND/ACTIVATE request must NOT alter the target user.
    if (approval.targetUserId && approval.requestType.startsWith("CREATE_")) {
      await prisma.user.update({
        where: { id: approval.targetUserId },
        data: { status: "INACTIVE", isActive: false }
      });
    }

    await logAuditEvent(req.user.id, "APPROVAL_REQUEST_REJECTED", "ADMINISTRATION", ipAddress, `Rejected request: ${approval.requestType} - ${approval.details}`, "SUCCESS");

    res.status(200).json({ success: true, data: updated, message: "Request rejected" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to reject request" });
  }
}

// Get approval counts (for dashboard badges)
export async function getApprovalCounts(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { role, branchId } = req.user;

    const scopeClause: any = {};
    if (role === "BANK_MANAGER" || role === "BRANCH_IT") {
      scopeClause.targetBranchId = branchId;
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [pendingCount, resolvedToday] = await Promise.all([
      prisma.approvalRequest.count({
        where: { ...scopeClause, status: "PENDING" }
      }),
      prisma.approvalRequest.count({
        where: {
          ...scopeClause,
          status: { not: "PENDING" },
          updatedAt: { gte: startOfToday }
        }
      })
    ]);

    res.status(200).json({ success: true, data: { pendingCount, resolvedToday } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to get approval counts" });
  }
}

