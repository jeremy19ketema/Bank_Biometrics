import { Response } from "express";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { logAuditEvent } from "../utils/audit.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

// Register a new device (IT Admins only)
export async function registerDevice(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { macAddress, name, branchId } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!req.user) return;

  try {
    const existing = await prisma.biometricDevice.findUnique({ where: { macAddress } });
    if (existing) {
      res.status(400).json({ success: false, message: "Device with this MAC address is already registered." });
      return;
    }

    // Generate a strong random secret key for the device
    const rawSecretKey = crypto.randomBytes(32).toString("hex");
    const secretKeyHash = await bcrypt.hash(rawSecretKey, 10);

    const device = await prisma.biometricDevice.create({
      data: {
        macAddress,
        name,
        branchId,
        secretKeyHash,
        status: branchId ? "OFFLINE" : "UNASSIGNED",
      }
    });

    await logAuditEvent(req.user.id, "DEVICE_REGISTERED", "ADMINISTRATION", ipAddress, `Registered new biometric device ${name} (${macAddress})`, "SUCCESS");

    // Return the secret key ONLY ONCE
    res.status(201).json({ 
      success: true, 
      data: {
        id: device.id,
        macAddress: device.macAddress,
        name: device.name,
        status: device.status,
        branchId: device.branchId,
      },
      secretKey: rawSecretKey // The device must store this securely!
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to register device" });
  }
}

// Device heartbeat/ping
export async function pingDevice(req: AuthenticatedRequest, res: Response): Promise<void> {
  // Wait, ping is called BY the device. It might not have a user JWT.
  // We need a custom middleware for device authentication, or handle it here.
  const authHeader = req.headers.authorization;
  const { macAddress, firmwareVersion } = req.body;
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
      await logAuditEvent(device.id, "DEVICE_AUTH_FAILED", "SECURITY", ipAddress, `Invalid credentials used for device ${macAddress}`, "FAILURE");
      res.status(401).json({ success: false, message: "Invalid device credentials" });
      return;
    }

    // Update last ping and IP
    const updated = await prisma.biometricDevice.update({
      where: { id: device.id },
      data: { 
        lastSyncAt: new Date(),
        ipAddress,
        firmwareVersion: firmwareVersion || device.firmwareVersion,
        status: device.status === "UNASSIGNED" || device.status === "REPAIR" || device.status === "RETIRED" ? device.status : "ONLINE"
      }
    });

    res.status(200).json({ success: true, message: "Ping successful", status: updated.status });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Ping failed" });
  }
}

// Get all devices (Scoped by branch for Managers, Global for Super Admin)
export async function getDevices(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) return;

  try {
    let whereClause: any = {};

    if (req.user.role === "BANK_MANAGER" || req.user.role === "BRANCH_IT") {
      if (!req.user.branchId) {
        res.status(403).json({ success: false, message: "You are not assigned to a branch" });
        return;
      }
      whereClause.branchId = req.user.branchId;
    } else if (req.user.role !== "SUPER_ADMIN" && req.user.role !== "SUPER_ADMIN_IT") {
       res.status(403).json({ success: false, message: "Insufficient permissions" });
       return;
    }

    const devices = await prisma.biometricDevice.findMany({
      where: whereClause,
      include: {
        branch: { select: { name: true, code: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    // Anonymize the IP or keep it for IT?
    res.status(200).json({ success: true, data: devices });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch devices" });
  }
}

export async function updateDeviceStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  const { status, branchId } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!req.user) return;

  try {
    const device = await prisma.biometricDevice.findUnique({ where: { id } });
    if (!device) {
      res.status(404).json({ success: false, message: "Device not found" });
      return;
    }

    // Branch assignment scoping
    if ((req.user.role === "BANK_MANAGER" || req.user.role === "BRANCH_IT") && device.branchId !== req.user.branchId) {
       res.status(403).json({ success: false, message: "Cannot modify a device outside your branch" });
       return;
    }

    const updated = await prisma.biometricDevice.update({
      where: { id },
      data: { status, branchId }
    });

    await logAuditEvent(req.user.id, "DEVICE_UPDATED", "ADMINISTRATION", ipAddress, `Device ${device.macAddress} status updated to ${status}`, "SUCCESS");

    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to update device" });
  }
}
