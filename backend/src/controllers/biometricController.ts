import { Response } from "express";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { logAuditEvent } from "../utils/audit.js";

export async function verifyScan(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { customerId, fingerIndex } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  if (!customerId || !fingerIndex) {
    res.status(400).json({ success: false, message: "CustomerId and fingerIndex are required" });
    return;
  }

  try {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      res.status(404).json({ success: false, message: "Customer not found" });
      return;
    }

    if (!customer.isBiometricEnrolled || !customer.enrolledFingerprints.includes(fingerIndex)) {
      // Create biometric failure log
      const scanLog = await prisma.biometricScanResult.create({
        data: {
          customerId: customer.id,
          matchScore: 12.5, // low score
          isMatch: false,
          fingerIndex,
          qualityScore: 92.0,
          deviceId: "HW-SCAN-FIPS-04",
          operatorId: req.user.id
        }
      });

      await logAuditEvent(
        req.user.id,
        "BIOMETRIC_MATCH_FAILED",
        "BIOMETRIC",
        ipAddress,
        `Fingerprint match negative for customer: ${customer.fullName} on ${fingerIndex}. Match score: 12.5%`,
        "WARNING"
      );

      res.status(200).json({
        success: true,
        data: {
          scanId: scanLog.scanId,
          customerId: customer.id,
          customerName: customer.fullName,
          matchScore: 12.5,
          isMatch: false,
          fingerIndex,
          qualityScore: 92.0,
          scannedAt: scanLog.scannedAt
        }
      });
      return;
    }

    // Match successful
    const matchScore = parseFloat((95.0 + Math.random() * 4.9).toFixed(2)); // 95% - 99.9%
    const qualityScore = parseFloat((90.0 + Math.random() * 9.9).toFixed(2)); // 90% - 99.9%

    const scanLog = await prisma.biometricScanResult.create({
      data: {
        customerId: customer.id,
        matchScore,
        isMatch: true,
        fingerIndex,
        qualityScore,
        deviceId: "HW-SCAN-FIPS-04",
        operatorId: req.user.id
      }
    });

    await logAuditEvent(
      req.user.id,
      "BIOMETRIC_MATCH_SUCCESS",
      "BIOMETRIC",
      ipAddress,
      `Biometric fingerprint matched successfully for ${customer.fullName}. Match score: ${matchScore}%`,
      "SUCCESS"
    );

    res.status(200).json({
      success: true,
      data: {
        scanId: scanLog.scanId,
        customerId: customer.id,
        customerName: customer.fullName,
        matchScore,
        isMatch: true,
        fingerIndex,
        qualityScore,
        scannedAt: scanLog.scannedAt
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Biometric matching failed" });
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
