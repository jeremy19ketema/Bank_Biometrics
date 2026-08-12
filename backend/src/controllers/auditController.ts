import { Response } from "express";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

export async function getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { category, status } = req.query;

  try {
    const logs = await prisma.systemAuditLog.findMany({
      where: {
        category: category ? (category as any) : undefined,
        status: status ? (status as any) : undefined
      },
      include: {
        actor: {
          select: { username: true, fullName: true, role: true }
        }
      },
      orderBy: { timestamp: "desc" }
    });

    const formatted = logs.map(l => ({
      id: l.id,
      timestamp: l.timestamp,
      actorId: l.actorId,
      actorName: l.actor.fullName,
      actorRole: l.actor.role,
      action: l.action,
      category: l.category,
      ipAddress: l.ipAddress,
      details: l.details,
      status: l.status
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve security audit trail" });
  }
}

export async function getSecurityMetrics(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const logs = await prisma.systemAuditLog.findMany();
    const failures = logs.filter(l => l.status === "FAILURE").length;
    const warnings = logs.filter(l => l.status === "WARNING").length;
    const successes = logs.filter(l => l.status === "SUCCESS").length;

    res.status(200).json({
      success: true,
      data: {
        totalSecurityEvents: logs.length,
        criticalThreatAlerts: failures,
        systemWarnings: warnings,
        hsmSyncStatus: "ACTIVE",
        cryptographicCompliance: "FIPS_140_2_LEVEL_3"
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to compile security metrics" });
  }
}
