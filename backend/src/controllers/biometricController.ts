import { Response } from "express";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { logAuditEvent } from "../utils/audit.js";

export async function verifyScan(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { 
    customerId, 
    fingerIndex, 
    deviceId, 
    transactionRef, 
    amount, 
    currency, 
    signature, 
    expiresAt, 
    livenessScore, 
    matchScore, 
    isMatch, 
    qualityScore 
  } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  // 1. Mandatory Fields & Security Checks
  if (!customerId || !fingerIndex || !deviceId || !signature || !expiresAt) {
    res.status(400).json({ success: false, message: "Missing required biometric assertion fields (including signature and expiresAt)" });
    return;
  }

  // 2. Expiry Check
  if (new Date(expiresAt) < new Date()) {
    res.status(403).json({ success: false, message: "Biometric scan assertion has expired" });
    return;
  }

  // 3. Liveness / Anti-Spoof Check
  if (livenessScore === undefined || livenessScore < 85.0) {
    await logAuditEvent(req.user.id, "BIOMETRIC_SPOOF_DETECTED", "SECURITY", ipAddress, `Spoof attempt detected for customer ${customerId}. Liveness score: ${livenessScore}`, "FAILURE");
    res.status(403).json({ success: false, message: "Liveness check failed. Spoofing detected." });
    return;
  }

  // 4. Cryptographic Signature Check (Mock)
  // In a real system, verify HMAC or RSA signature of the payload using the device's public key.
  const expectedSignaturePrefix = `device-sig-${deviceId}-`;
  if (!signature.startsWith(expectedSignaturePrefix)) {
    await logAuditEvent(req.user.id, "BIOMETRIC_SIGNATURE_INVALID", "SECURITY", ipAddress, `Invalid device signature for customer ${customerId} from device ${deviceId}`, "FAILURE");
    res.status(403).json({ success: false, message: "Invalid biometric signature" });
    return;
  }

  try {
    // 5. Device Verification
    const device = await prisma.biometricDevice.findUnique({ where: { id: deviceId } });
    if (!device) {
      res.status(404).json({ success: false, message: "Biometric device not registered" });
      return;
    }

    // 6. Customer & Consent Verification
    const customer = await prisma.customer.findUnique({ 
      where: { id: customerId },
      include: { biometricConsent: true }
    });

    if (!customer) {
      res.status(404).json({ success: false, message: "Customer not found" });
      return;
    }

    if (!customer.isBiometricEnrolled || !customer.biometricConsent) {
      res.status(403).json({ success: false, message: "Customer is not enrolled in biometrics" });
      return;
    }

    if (customer.biometricConsent.isRevoked) {
      res.status(403).json({ success: false, message: "Customer biometric consent has been revoked" });
      return;
    }

    // 7. Store the verified scan assertion (no raw templates)
    const scanLog = await prisma.biometricScanResult.create({
      data: {
        customerId: customer.id,
        matchScore: matchScore || 0,
        isMatch: isMatch || false,
        fingerIndex,
        qualityScore: qualityScore || 0,
        livenessScore,
        deviceId: device.id,
        operatorId: req.user.id,
        transactionRef,
        amount,
        currency,
        signature,
        expiresAt: new Date(expiresAt)
      }
    });

    if (!isMatch) {
      await logAuditEvent(req.user.id, "BIOMETRIC_MATCH_FAILED", "BIOMETRIC", ipAddress, `Fingerprint match negative for customer: ${customer.fullName}`, "WARNING");
      res.status(200).json({ success: true, data: { scanId: scanLog.scanId, isMatch: false, message: "Biometric match failed" } });
      return;
    }

    await logAuditEvent(req.user.id, "BIOMETRIC_MATCH_SUCCESS", "BIOMETRIC", ipAddress, `Biometric matched successfully for ${customer.fullName} for transaction ${transactionRef || "N/A"}`, "SUCCESS");

    res.status(200).json({
      success: true,
      data: {
        scanId: scanLog.scanId,
        isMatch: true,
        transactionRef,
        message: "Biometric assertion validated successfully"
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Biometric processing failed" });
  }
}

export async function getScanHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const history = await prisma.biometricScanResult.findMany({
      include: {
        customer: { select: { fullName: true, accountNumber: true } },
        operator: { select: { fullName: true, role: true } }
      },
      orderBy: { scannedAt: "desc" }
    });

    const formattedHistory = history.map(h => ({
      scanId: h.scanId,
      customerId: h.customerId,
      customerName: h.customer?.fullName || "Walk-In / Unknown",
      accountNumber: h.customer?.accountNumber || "N/A",
      matchScore: h.matchScore,
      isMatch: h.isMatch,
      fingerIndex: h.fingerIndex,
      qualityScore: h.qualityScore,
      scannedAt: h.scannedAt,
      operatorName: h.operator.fullName,
      operatorRole: h.operator.role,
      deviceId: h.deviceId
    }));

    res.status(200).json({ success: true, data: formattedHistory });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve scan history" });
  }
}

export async function getScanStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const scans = await prisma.biometricScanResult.findMany();
    const total = scans.length;
    const matches = scans.filter(s => s.isMatch).length;
    const failures = total - matches;
    const successRate = total > 0 ? parseFloat(((matches / total) * 100).toFixed(2)) : 100.0;
    
    const averageQuality = total > 0 
      ? parseFloat((scans.reduce((sum, s) => sum + s.qualityScore, 0) / total).toFixed(2)) 
      : 95.0;

    res.status(200).json({
      success: true,
      data: {
        totalScansToday: total,
        successRate,
        averageQualityScore: averageQuality,
        matchFailures: failures
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to compile biometric metrics" });
  }
}
