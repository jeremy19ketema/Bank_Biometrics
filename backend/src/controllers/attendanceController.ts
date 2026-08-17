import { Response } from "express";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { logAuditEvent } from "../utils/audit.js";
import bcrypt from "bcrypt";

// Device clocks in/out a user
export async function clockInOut(req: AuthenticatedRequest, res: Response): Promise<void> {
  const authHeader = req.headers.authorization;
  const { deviceEventId, userId, macAddress, type, deviceTimestamp, timezone } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!authHeader || !authHeader.startsWith("Device ")) {
    res.status(401).json({ success: false, message: "Missing or invalid Device authorization header" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const device = await prisma.biometricDevice.findUnique({ where: { macAddress } });
    if (!device) {
      res.status(404).json({ success: false, message: "Device not found" });
      return;
    }

    const isValid = await bcrypt.compare(token, device.secretKeyHash);
    if (!isValid) {
      await logAuditEvent(device.id, "ATTENDANCE_AUTH_FAILED", "SECURITY", ipAddress, `Invalid credentials used for device ${macAddress} during clock event`, "FAILURE");
      res.status(401).json({ success: false, message: "Invalid device credentials" });
      return;
    }

    if (device.status === "UNASSIGNED" || device.status === "REPAIR" || device.status === "RETIRED") {
      res.status(403).json({ success: false, message: "Device is not authorized to accept attendance events in its current status." });
      return;
    }

    // Check idempotency key to prevent duplicates
    const existingEvent = await prisma.attendanceEvent.findUnique({ where: { deviceEventId } });
    if (existingEvent) {
      res.status(200).json({ success: true, message: "Event already recorded", data: existingEvent });
      return;
    }

    const event = await prisma.attendanceEvent.create({
      data: {
        deviceEventId,
        userId,
        deviceId: device.id,
        type,
        deviceTimestamp: new Date(deviceTimestamp),
        timezone: timezone || "UTC",
        source: "DEVICE"
      }
    });

    res.status(201).json({ success: true, data: event });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to record attendance" });
  }
}

// Request a manual correction
export async function requestCorrection(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { attendanceEventId, adjustedTimestamp, adjustedType, reason } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!req.user) return;

  try {
    const originalEvent = await prisma.attendanceEvent.findUnique({ where: { id: attendanceEventId } });
    if (!originalEvent) {
      res.status(404).json({ success: false, message: "Original attendance event not found" });
      return;
    }

    const adjustment = await prisma.attendanceAdjustment.create({
      data: {
        attendanceEventId,
        adjustedTimestamp: new Date(adjustedTimestamp),
        adjustedType,
        reason,
        requestedById: req.user.id,
        status: "PENDING"
      }
    });

    await logAuditEvent(req.user.id, "ATTENDANCE_CORRECTION_REQUESTED", "ADMINISTRATION", ipAddress, `Requested manual correction for attendance event ${attendanceEventId}`, "SUCCESS");

    res.status(201).json({ success: true, data: adjustment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to request correction" });
  }
}

// Approve or reject a manual correction (Maker != Checker)
export async function processCorrection(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  const { status } = req.body; // APPROVED or REJECTED
  const ipAddress = req.ip || "unknown";

  if (!req.user) return;

  try {
    const adjustment = await prisma.attendanceAdjustment.findUnique({ 
      where: { id },
      include: { attendanceEvent: { include: { user: true } } }
    });

    if (!adjustment) {
      res.status(404).json({ success: false, message: "Correction request not found" });
      return;
    }

    if (adjustment.requestedById === req.user.id) {
      res.status(403).json({ success: false, message: "You cannot approve your own correction request" });
      return;
    }

    // Branch scoping enforcement for HR
    if (req.user.role === "HR" || req.user.role === "BANK_MANAGER") {
      if (req.user.branchId && adjustment.attendanceEvent.user.branchId !== req.user.branchId) {
        res.status(403).json({ success: false, message: "Cannot approve a correction outside your branch" });
        return;
      }
    }

    const processed = await prisma.attendanceAdjustment.update({
      where: { id },
      data: {
        status,
        approvedById: req.user.id
      }
    });

    await logAuditEvent(req.user.id, "ATTENDANCE_CORRECTION_PROCESSED", "ADMINISTRATION", ipAddress, `Processed manual correction ${id} as ${status}`, "SUCCESS");

    res.status(200).json({ success: true, data: processed });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to process correction" });
  }
}

// Get attendance events
export async function getAttendanceEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) return;

  try {
    let whereClause: any = {};

    // Branch scoping
    if (req.user.role === "BANK_MANAGER" || req.user.role === "HR") {
      if (!req.user.branchId) {
        res.status(403).json({ success: false, message: "You are not assigned to a branch" });
        return;
      }
      whereClause.user = { branchId: req.user.branchId };
    }

    const events = await prisma.attendanceEvent.findMany({
      where: whereClause,
      include: {
        user: { select: { fullName: true, username: true } },
        device: { select: { name: true, macAddress: true } },
        adjustments: true
      },
      orderBy: { deviceTimestamp: "desc" },
      take: 200 // Limit for now
    });

    res.status(200).json({ success: true, data: events });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch attendance events" });
  }
}
