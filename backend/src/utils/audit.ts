import { prisma } from "../config/db.js";
import { AuditCategory, AuditStatus } from "@prisma/client";

export async function logAuditEvent(
  actorId: string,
  action: string,
  category: AuditCategory,
  ipAddress: string,
  details: string,
  status: AuditStatus
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
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
