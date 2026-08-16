import { Response } from "express";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { logAuditEvent } from "../utils/audit.js";

// --- SECURITY ALERTS ---

export async function getAlerts(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const alerts = await prisma.securityAlert.findMany({
      include: {
        assignedTo: { select: { username: true, fullName: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    res.status(200).json({ success: true, data: alerts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch alerts" });
  }
}

export async function acknowledgeAlert(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const ipAddress = req.ip || "unknown";

  try {
    const alert = await prisma.securityAlert.update({
      where: { id },
      data: { acknowledgedAt: new Date() }
    });

    await logAuditEvent(req.user!.id, "ALERT_ACKNOWLEDGED", "SECURITY", ipAddress, `Acknowledged alert: ${alert.eventType} (${alert.id})`, "SUCCESS");

    res.status(200).json({ success: true, data: alert });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to acknowledge alert" });
  }
}

export async function escalateAlert(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { level } = req.body;
  const ipAddress = req.ip || "unknown";

  try {
    const alert = await prisma.securityAlert.update({
      where: { id },
      data: { escalationLevel: level }
    });

    await logAuditEvent(req.user!.id, "ALERT_ESCALATED", "SECURITY", ipAddress, `Escalated alert ${alert.id} to ${level}`, "WARNING");

    res.status(200).json({ success: true, data: alert });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to escalate alert" });
  }
}

export async function resolveAlert(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const ipAddress = req.ip || "unknown";

  try {
    const alert = await prisma.securityAlert.update({
      where: { id },
      data: { isResolved: true, resolvedAt: new Date() }
    });

    await logAuditEvent(req.user!.id, "ALERT_RESOLVED", "SECURITY", ipAddress, `Resolved alert ${alert.id}`, "SUCCESS");

    res.status(200).json({ success: true, data: alert });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to resolve alert" });
  }
}

// --- MAKER-CHECKER POLICY APPROVALS ---

export async function proposePolicyChange(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { policyType, policyId, changes } = req.body;
  const ipAddress = req.ip || "unknown";

  try {
    // Determine the current policy to get "beforeValue"
    let currentPolicy: any = null;
    if (policyType === "GLOBAL_SECURITY") {
      currentPolicy = await prisma.globalSecurityPolicy.findUnique({ where: { id: policyId } });
    } else if (policyType === "BIOMETRIC") {
      currentPolicy = await prisma.biometricPolicy.findUnique({ where: { id: policyId } });
    }

    if (!currentPolicy) {
      res.status(404).json({ success: false, message: "Policy not found" });
      return;
    }

    // Save as ApprovalRequest
    const request = await prisma.approvalRequest.create({
      data: {
        requestType: `POLICY_UPDATE_${policyType}`,
        requestedById: req.user!.id,
        requestedByName: req.user!.username,
        details: JSON.stringify({
          policyId,
          beforeValue: currentPolicy,
          afterValue: { ...currentPolicy, ...changes }
        })
      }
    });

    await logAuditEvent(req.user!.id, "POLICY_CHANGE_PROPOSED", "POLICY_CHANGE", ipAddress, `Proposed changes to ${policyType} policy ${policyId}`, "SUCCESS");

    res.status(201).json({ success: true, data: request });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to propose policy change" });
  }
}

export async function approvePolicyChange(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { isApproved, reason } = req.body;
  const ipAddress = req.ip || "unknown";

  try {
    const request = await prisma.approvalRequest.findUnique({ where: { id } });
    if (!request) {
      res.status(404).json({ success: false, message: "Approval request not found" });
      return;
    }

    if (request.status !== "PENDING") {
      res.status(400).json({ success: false, message: "Request is not pending" });
      return;
    }

    // MAKER-CHECKER ENFORCEMENT: Policy-maker cannot approve their own policy request.
    if (request.requestedById === req.user!.id) {
      await logAuditEvent(req.user!.id, "POLICY_APPROVAL_REJECTED", "SECURITY", ipAddress, "Attempted self-approval of policy request", "WARNING");
      res.status(403).json({ success: false, message: "Maker-checker violation: You cannot approve your own request." });
      return;
    }

    const details = JSON.parse(request.details);

    if (!isApproved) {
      const updatedReq = await prisma.approvalRequest.update({
        where: { id },
        data: { status: "REJECTED", approvedById: req.user!.id, rejectionReason: reason || "Rejected by checker" }
      });
      await logAuditEvent(req.user!.id, "POLICY_CHANGE_REJECTED", "POLICY_CHANGE", ipAddress, `Rejected policy update request ${id}`, "SUCCESS");
      res.status(200).json({ success: true, data: updatedReq });
      return;
    }

    // Apply the policy change
    if (request.requestType === "POLICY_UPDATE_GLOBAL_SECURITY") {
      const { id: _, createdAt, updatedAt, ...safeData } = details.afterValue;
      await prisma.globalSecurityPolicy.update({
        where: { id: details.policyId },
        data: safeData
      });
    } else if (request.requestType === "POLICY_UPDATE_BIOMETRIC") {
       const { id: _, createdAt, updatedAt, ...safeData } = details.afterValue;
       await prisma.biometricPolicy.update({
        where: { id: details.policyId },
        data: safeData
      });
    }

    const updatedReq = await prisma.approvalRequest.update({
      where: { id },
      data: { status: "APPROVED", approvedById: req.user!.id }
    });

    await logAuditEvent(req.user!.id, "POLICY_CHANGE_APPROVED", "POLICY_CHANGE", ipAddress, `Approved and applied policy update request ${id}`, "SUCCESS", { targetType: "POLICY", targetId: details.policyId });

    res.status(200).json({ success: true, data: updatedReq });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to process policy approval" });
  }
}

// --- SYSTEM HEALTH ---

export async function getSystemHealth(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const backups = await prisma.systemBackup.findMany({ orderBy: { startedAt: "desc" }, take: 10 });
    const maintenance = await prisma.maintenanceWindow.findMany({ orderBy: { startTime: "desc" }, take: 5 });

    res.status(200).json({
      success: true,
      data: {
        backups,
        maintenance
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch system health" });
  }
}
