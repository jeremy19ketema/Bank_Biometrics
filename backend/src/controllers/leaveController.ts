import { Response } from "express";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { logAuditEvent } from "../utils/audit.js";

// --- LEAVE ---

export async function requestLeave(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { startDate, endDate, type, reason } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!req.user) return;

  try {
    const leave = await prisma.leaveRequest.create({
      data: {
        userId: req.user.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type,
        reason,
        status: "PENDING"
      }
    });

    await logAuditEvent(req.user.id, "LEAVE_REQUESTED", "ADMINISTRATION", ipAddress, `Requested ${type} leave from ${startDate} to ${endDate}`, "SUCCESS");

    res.status(201).json({ success: true, data: leave });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to request leave" });
  }
}

export async function approveLeave(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  const { status } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!req.user) return;

  try {
    const leave = await prisma.leaveRequest.findUnique({ 
      where: { id },
      include: { user: true }
    });

    if (!leave) {
      res.status(404).json({ success: false, message: "Leave request not found" });
      return;
    }

    if (leave.userId === req.user.id) {
      res.status(403).json({ success: false, message: "Cannot approve your own leave request" });
      return;
    }

    // Branch scoping
    if (req.user.role === "HR" || req.user.role === "BANK_MANAGER") {
      if (req.user.branchId && leave.user.branchId !== req.user.branchId) {
        res.status(403).json({ success: false, message: "Cannot approve leave for a user outside your branch" });
        return;
      }
    }

    const processed = await prisma.leaveRequest.update({
      where: { id },
      data: { status, approvedById: req.user.id }
    });

    await logAuditEvent(req.user.id, "LEAVE_PROCESSED", "ADMINISTRATION", ipAddress, `Processed leave ${id} as ${status}`, "SUCCESS");

    res.status(200).json({ success: true, data: processed });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to process leave" });
  }
}

// --- OVERTIME ---

export async function requestOvertime(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { date, hours, reason } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!req.user) return;

  try {
    const overtime = await prisma.overtimeRequest.create({
      data: {
        userId: req.user.id,
        date: new Date(date),
        hours,
        reason,
        status: "PENDING"
      }
    });

    await logAuditEvent(req.user.id, "OVERTIME_REQUESTED", "ADMINISTRATION", ipAddress, `Requested ${hours} hours overtime for ${date}`, "SUCCESS");

    res.status(201).json({ success: true, data: overtime });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to request overtime" });
  }
}

export async function approveOvertime(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  const { status } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!req.user) return;

  try {
    const overtime = await prisma.overtimeRequest.findUnique({ 
      where: { id },
      include: { user: true }
    });

    if (!overtime) {
      res.status(404).json({ success: false, message: "Overtime request not found" });
      return;
    }

    if (overtime.userId === req.user.id) {
      res.status(403).json({ success: false, message: "Cannot approve your own overtime request" });
      return;
    }

    // Branch scoping
    if (req.user.role === "HR" || req.user.role === "BANK_MANAGER") {
      if (req.user.branchId && overtime.user.branchId !== req.user.branchId) {
        res.status(403).json({ success: false, message: "Cannot approve overtime for a user outside your branch" });
        return;
      }
    }

    const processed = await prisma.overtimeRequest.update({
      where: { id },
      data: { status, approvedById: req.user.id }
    });

    await logAuditEvent(req.user.id, "OVERTIME_PROCESSED", "ADMINISTRATION", ipAddress, `Processed overtime ${id} as ${status}`, "SUCCESS");

    res.status(200).json({ success: true, data: processed });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to process overtime" });
  }
}
