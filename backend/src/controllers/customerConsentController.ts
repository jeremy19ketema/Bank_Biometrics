import { Response } from "express";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { logAuditEvent } from "../utils/audit.js";

// Capture Customer Biometric Consent
export async function submitCustomerConsent(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { customerId, documentReference, checksum, policyVersion, captureMetadata } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!req.user) return;

  try {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      res.status(404).json({ success: false, message: "Customer not found" });
      return;
    }

    const consent = await prisma.customerBiometricConsent.upsert({
      where: { customerId },
      create: {
        customerId,
        documentReference,
        checksum,
        policyVersion,
        captureMetadata: JSON.stringify(captureMetadata)
      },
      update: {
        documentReference,
        checksum,
        policyVersion,
        captureMetadata: JSON.stringify(captureMetadata),
        isRevoked: false,
        revokedAt: null,
        signedTimestamp: new Date()
      }
    });

    await logAuditEvent(
      req.user.id, 
      "CUSTOMER_BIOMETRIC_CONSENT_CAPTURED", 
      "BIOMETRIC", 
      ipAddress, 
      `Captured biometric consent for customer ${customer.accountNumber} (Version ${policyVersion})`, 
      "SUCCESS"
    );

    res.status(200).json({ success: true, data: consent });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to capture consent" });
  }
}

// Revoke Customer Biometric Consent
export async function revokeCustomerConsent(req: AuthenticatedRequest, res: Response): Promise<void> {
  const customerId = req.params.id as string;
  const ipAddress = req.ip || "unknown";

  if (!req.user) return;

  try {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      res.status(404).json({ success: false, message: "Customer not found" });
      return;
    }

    const existing = await prisma.customerBiometricConsent.findUnique({ where: { customerId } });
    if (!existing) {
      res.status(404).json({ success: false, message: "No active consent found to revoke" });
      return;
    }

    const revoked = await prisma.customerBiometricConsent.update({
      where: { customerId },
      data: {
        isRevoked: true,
        revokedAt: new Date()
      }
    });

    // Also update customer status to unenrolled
    await prisma.customer.update({
      where: { id: customerId },
      data: { isBiometricEnrolled: false }
    });

    await logAuditEvent(
      req.user.id, 
      "CUSTOMER_BIOMETRIC_CONSENT_REVOKED", 
      "BIOMETRIC", 
      ipAddress, 
      `Revoked biometric consent for customer ${customer.accountNumber}`, 
      "SUCCESS"
    );

    res.status(200).json({ success: true, data: revoked });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to revoke consent" });
  }
}
