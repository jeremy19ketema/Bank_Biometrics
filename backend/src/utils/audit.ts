import { prisma } from "../config/db.js";
import { AuditCategory, AuditStatus, AlertSeverity } from "@prisma/client";

export interface AuditScopes {
  organizationId?: string;
  regionId?: string;
  branchId?: string;
  departmentId?: string;
  targetType?: string;
  targetId?: string;
  severity?: AlertSeverity;
}

export async function logAuditEvent(
  actorId: string,
  action: string,
  category: AuditCategory,
  ipAddress: string,
  details: string,
  status: AuditStatus,
  scopes?: AuditScopes
): Promise<void> {
  try {
    await prisma.systemAuditLog.create({
      data: {
        actorId,
        action,
        category,
        ipAddress,
        details,
        status,
        organizationId: scopes?.organizationId,
        regionId: scopes?.regionId,
        branchId: scopes?.branchId,
        departmentId: scopes?.departmentId,
        targetType: scopes?.targetType,
        targetId: scopes?.targetId,
        severity: scopes?.severity || "LOW",
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
