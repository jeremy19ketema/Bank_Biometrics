import { Response } from "express";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { logAuditEvent } from "../utils/audit.js";
import { CustomerStatus } from "@prisma/client";

export async function searchCustomers(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { query } = req.query;

  try {
    const customers = await prisma.customer.findMany({
      where: query ? {
        OR: [
          { accountNumber: { contains: String(query), mode: "insensitive" } },
          { fullName: { contains: String(query), mode: "insensitive" } },
          { nationalId: { contains: String(query), mode: "insensitive" } },
          { phone: { contains: String(query) } }
        ]
      } : {},
      orderBy: { fullName: "asc" }
    });

    res.status(200).json({ success: true, data: customers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to search customer database" });
  }
}

export async function getCustomerById(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = String(req.params.id);

  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        biometricScans: {
          orderBy: { scannedAt: "desc" },
          take: 5
        }
      }
    });

    if (!customer) {
      res.status(404).json({ success: false, message: "Customer account not found" });
      return;
    }

    res.status(200).json({ success: true, data: customer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve customer file" });
  }
}

export async function createCustomer(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { accountNumber, fullName, nationalId, phone, email, accountType, balance } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!accountNumber || !fullName || !nationalId || !phone || !email || !accountType || balance === undefined) {
    res.status(400).json({ success: false, message: "Missing required customer registry details" });
    return;
  }

  try {
    const existing = await prisma.customer.findFirst({
      where: {
        OR: [{ accountNumber }, { nationalId }]
      }
    });

    if (existing) {
      res.status(400).json({ success: false, message: "Customer accountNumber or nationalId already exists" });
      return;
    }

    const customer = await prisma.customer.create({
      data: {
        accountNumber,
        fullName,
        nationalId,
        phone,
        email,
        accountType,
        balance: parseFloat(balance),
        isBiometricEnrolled: false,
        enrolledFingerprints: [],
        status: "ACTIVE"
      }
    });

    if (req.user) {
      await logAuditEvent(req.user.id, "CUSTOMER_REGISTRATION", "ADMINISTRATION", ipAddress, `Registered new customer account: ${fullName} (${accountNumber})`, "SUCCESS");
    }

    res.status(201).json({ success: true, data: customer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to register customer" });
  }
}

export async function enrollBiometrics(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = String(req.params.id);
  const { fingerprints } = req.body; // Array of fingerprints e.g., ["RIGHT_INDEX"]
  const ipAddress = req.ip || "unknown";

  if (!fingerprints || !Array.isArray(fingerprints) || fingerprints.length === 0) {
    res.status(400).json({ success: false, message: "Fingerprint templates are required for enrollment" });
    return;
  }

  try {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      res.status(404).json({ success: false, message: "Customer not found" });
      return;
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        isBiometricEnrolled: true,
        enrolledFingerprints: fingerprints
      }
    });

    if (req.user) {
      await logAuditEvent(
        req.user.id,
        "BIOMETRIC_ENROLL",
        "BIOMETRIC",
        ipAddress,
        `Enrolled biometric fingerprints (${fingerprints.join(", ")}) for customer: ${customer.fullName}`,
        "SUCCESS"
      );
    }

    res.status(200).json({ success: true, data: updatedCustomer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Biometric enrollment failed" });
  }
}

export async function updateCustomerStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = String(req.params.id);
  const { status } = req.body; // ACTIVE, FLAGGED, FROZEN
  const ipAddress = req.ip || "unknown";

  try {
    const customer = await prisma.customer.update({
      where: { id },
      data: { status: status as CustomerStatus }
    });

    if (req.user) {
      await logAuditEvent(
        req.user.id,
        "CUSTOMER_STATUS_UPDATE",
        "ADMINISTRATION",
        ipAddress,
        `Updated status for customer: ${customer.fullName} to ${status}`,
        "SUCCESS"
      );
    }

    res.status(200).json({ success: true, data: customer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to update customer status" });
  }
}
