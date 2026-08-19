import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { prisma } from "../config/db.js";
import { logAuditEvent } from "../utils/audit.js";

export async function escalateAlert(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { alertId } = req.params;
    const { reason } = req.body;

    const alert = await prisma.systemAuditLog.findUnique({ where: { id: alertId } });
    if (!alert) {
      res.status(404).json({ success: false, message: "Alert not found" });
      return;
    }

    // In a real DR scenario, this would trigger an external PagerDuty/SMS API.
    // For now, we update the severity and log it.
    await prisma.systemAuditLog.update({
      where: { id: alertId },
      data: { severity: "CRITICAL", details: alert.details + ` | ESCALATED by ${req.user!.id} - Reason: ${reason}` }
    });

    await logAuditEvent(req.user!.id, "ALERT_ESCALATED", "SECURITY", req.ip || "unknown", `Alert ${alertId} escalated to CRITICAL. Reason: ${reason}`, "SUCCESS");

    res.status(200).json({ success: true, message: "Alert escalated successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function checkSystemStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    // Determine the user's scope
    const filter = req.user!.branchId && req.user!.role !== "SUPER_ADMIN" ? { branchId: req.user!.branchId } : {};

    // Get device uptimes
    const devices = await prisma.biometricDevice.findMany({ where: filter });
    const totalDevices = devices.length;
    const onlineDevices = devices.filter(d => d.status === "ONLINE").length;
    
    const uptimePercentage = totalDevices > 0 ? (onlineDevices / totalDevices) * 100 : 100;

    // In a real system, we'd ping the core banking API as well.
    const integrations = [
      { name: "Core Banking API", status: "ONLINE", latency: "45ms" },
      { name: "Vendor Biometric Engine", status: "ONLINE", latency: "12ms" }
    ];

    res.status(200).json({
      success: true,
      data: {
        uptimePercentage,
        onlineDevices,
        totalDevices,
        integrations
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
