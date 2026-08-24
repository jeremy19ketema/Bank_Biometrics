import { Response } from "express";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { logAuditEvent } from "../utils/audit.js";

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
      if (approval.requestType.startsWith("CREATE_")) {
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

    const updated = await prisma.approvalRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        approvedById: req.user.id,
        rejectionReason: rejectionReason || "No reason provided"
      }
    });

    // If the request was about a user creation that was rejected, clean up
    if (approval.targetUserId) {
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

    let whereClause: any = { status: "PENDING" };

    if (role === "BANK_MANAGER" || role === "BRANCH_IT") {
      whereClause.targetBranchId = branchId;
    }

    const count = await prisma.approvalRequest.count({
      where: whereClause
    });

    res.status(200).json({ success: true, data: { pendingCount: count } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to get approval counts" });
  }
}

