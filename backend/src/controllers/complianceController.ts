import { Response } from "express";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { logAuditEvent } from "../utils/audit.js";

// --- COMPLIANCE COURSES ---
export async function getCourses(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const courses = await prisma.complianceCourse.findMany({
      where: { isActive: true },
      orderBy: { title: "asc" }
    });
    res.json({ success: true, data: courses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch courses" });
  }
}

// --- STAFF COMPLIANCE RECORDS ---
export async function assignCompliance(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { targetUserId, courseId, dueDate } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!req.user) return;

  try {
    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      res.status(404).json({ success: false, message: "Target user not found" });
      return;
    }

    // Branch scoping
    if (req.user.role !== "SUPER_ADMIN" && req.user.role !== "SUPER_ADMIN_HR") {
      if (req.user.branchId && targetUser.branchId !== req.user.branchId) {
        res.status(403).json({ success: false, message: "Cannot assign compliance outside your branch" });
        return;
      }
    }

    // Assigning compliance
    const record = await prisma.staffComplianceRecord.create({
      data: {
        userId: targetUserId,
        courseId,
        dueDate: new Date(dueDate),
        status: "PENDING"
      }
    });

    await logAuditEvent(req.user.id, "COMPLIANCE_ASSIGNED", "ADMINISTRATION", ipAddress, `Assigned course ${courseId} to ${targetUser.username}`, "SUCCESS");

    res.status(201).json({ success: true, data: record });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to assign compliance" });
  }
}

export async function verifyCompliance(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  const { status, documentReference } = req.body; // status: "COMPLETED", "FAILED"
  const ipAddress = req.ip || "unknown";

  if (!req.user) return;

  try {
    const record = await prisma.staffComplianceRecord.findUnique({ 
      where: { id },
      include: { course: true, user: true }
    });

    if (!record) {
      res.status(404).json({ success: false, message: "Compliance record not found" });
      return;
    }

    // Branch scoping
    if (req.user.role !== "SUPER_ADMIN" && req.user.role !== "SUPER_ADMIN_HR") {
      if (req.user.branchId && record.user.branchId !== req.user.branchId) {
        res.status(403).json({ success: false, message: "Cannot verify compliance outside your branch" });
        return;
      }
    }

    const completionDate = status === "COMPLETED" ? new Date() : null;
    let expiryDate = null;

    if (status === "COMPLETED" && record.course.validityMonths > 0) {
      expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + record.course.validityMonths);
    }

    const updated = await prisma.staffComplianceRecord.update({
      where: { id },
      data: {
        status,
        documentReference: documentReference || record.documentReference,
        completionDate,
        expiryDate,
        verifierId: req.user.id
      }
    });

    await logAuditEvent(req.user.id, "COMPLIANCE_VERIFIED", "ADMINISTRATION", ipAddress, `Verified compliance ${id} as ${status}`, "SUCCESS");

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to verify compliance" });
  }
}

export async function getStaffCompliance(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    let whereClause: any = {};
    if (req.user && !req.user.role.startsWith("SUPER_ADMIN")) {
      whereClause = { user: { branchId: req.user.branchId } };
    }

    const records = await prisma.staffComplianceRecord.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, username: true, fullName: true, branchId: true } },
        course: { select: { id: true, title: true, category: true } },
        verifier: { select: { id: true, username: true, fullName: true } }
      },
      orderBy: { dueDate: "asc" }
    });
    res.json({ success: true, data: records });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch staff compliance" });
  }
}
