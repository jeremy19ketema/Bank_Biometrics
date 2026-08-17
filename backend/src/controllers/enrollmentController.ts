import { Response } from "express";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { logAuditEvent } from "../utils/audit.js";

// Capture Staff Biometric Consent
export async function submitConsent(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { targetUserId, consentVersion, captureMethod, documentReference } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!req.user) return;

  try {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      res.status(404).json({ success: false, message: "Target user not found" });
      return;
    }

    // Scoping: HR/Managers can only capture consent for users in their branch
    if (req.user.role === "HR" || req.user.role === "BANK_MANAGER") {
      if (req.user.branchId && user.branchId !== req.user.branchId) {
        res.status(403).json({ success: false, message: "Cannot capture consent for a user outside your branch" });
        return;
      }
    }

    const consent = await prisma.staffBiometricConsent.upsert({
      where: { userId: targetUserId },
      create: {
        userId: targetUserId,
        consentVersion,
        captureMethod,
        documentReference,
      },
      update: {
        consentVersion,
        captureMethod,
        documentReference,
        isRevoked: false,
        revokedAt: null,
        signedTimestamp: new Date(),
      }
    });

    await logAuditEvent(
      req.user.id, 
      "BIOMETRIC_CONSENT_CAPTURED", 
      "BIOMETRIC", 
      ipAddress, 
      `Captured biometric consent for user ${user.username} (Version ${consentVersion})`, 
      "SUCCESS"
    );

    res.status(200).json({ success: true, data: consent });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to capture consent" });
  }
}

// Revoke Staff Biometric Consent
export async function revokeConsent(req: AuthenticatedRequest, res: Response): Promise<void> {
  const targetUserId = req.params.id as string;
  const ipAddress = req.ip || "unknown";

  if (!req.user) return;

  try {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // A user can revoke their own, or HR/SuperAdmin can revoke
    if (req.user.id !== targetUserId && !["SUPER_ADMIN", "HR"].includes(req.user.role)) {
       res.status(403).json({ success: false, message: "Insufficient permissions to revoke consent" });
       return;
    }

    const existing = await prisma.staffBiometricConsent.findUnique({ where: { userId: targetUserId } });
    if (!existing) {
      res.status(404).json({ success: false, message: "No active consent found to revoke" });
      return;
    }

    const revoked = await prisma.staffBiometricConsent.update({
      where: { userId: targetUserId },
      data: {
        isRevoked: true,
        revokedAt: new Date()
      }
    });

    // NOTE: In a real environment, revoking consent should trigger deletion of biometric templates
    await logAuditEvent(
      req.user.id, 
      "BIOMETRIC_CONSENT_REVOKED", 
      "BIOMETRIC", 
      ipAddress, 
      `Revoked biometric consent for user ${user.username}`, 
      "SUCCESS"
    );

    res.status(200).json({ success: true, data: revoked });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to revoke consent" });
  }
}
