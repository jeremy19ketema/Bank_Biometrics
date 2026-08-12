import { Response } from "express";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { logAuditEvent } from "../utils/audit.js";

export async function getBranches(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const branches = await prisma.branch.findMany({
      include: {
        _count: {
          select: { users: true }
        },
        users: {
          where: { role: "BANK_MANAGER" },
          select: { fullName: true }
        }
      },
      orderBy: { code: "asc" }
    });

    const formattedBranches = branches.map(b => ({
      id: b.id,
      code: b.code,
      name: b.name,
      city: b.city,
      address: b.address,
      phone: b.phone,
      email: b.email,
      status: b.status,
      dailyTransactionLimit: b.dailyTransactionLimit,
      createdAt: b.createdAt,
      managerName: b.users[0]?.fullName || "Unassigned",
      tellerCount: b._count.users
    }));

    res.status(200).json({ success: true, data: formattedBranches });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve branches" });
  }
}

export async function getBranchById(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = String(req.params.id);

  try {
    const b = await prisma.branch.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, fullName: true, role: true, email: true, status: true }
        }
      }
    });

    if (!b) {
      res.status(404).json({ success: false, message: "Branch not found" });
      return;
    }

    const manager = b.users.find(u => u.role === "BANK_MANAGER");
    const tellers = b.users.filter(u => u.role === "ACCOUNTANT");

    res.status(200).json({
      success: true,
      data: {
        id: b.id,
        code: b.code,
        name: b.name,
        city: b.city,
        address: b.address,
        phone: b.phone,
        email: b.email,
        status: b.status,
        dailyTransactionLimit: b.dailyTransactionLimit,
        createdAt: b.createdAt,
        managerName: manager?.fullName || "Unassigned",
        tellerCount: tellers.length,
        staff: b.users
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve branch details" });
  }
}

export async function createBranch(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { code, name, city, address, phone, email, dailyTransactionLimit } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!code || !name || !city || !address || !phone || !email || dailyTransactionLimit === undefined) {
    res.status(400).json({ success: false, message: "All fields are required" });
    return;
  }

  try {
    const existing = await prisma.branch.findUnique({ where: { code } });
    if (existing) {
      res.status(400).json({ success: false, message: `Branch code ${code} is already provisioned` });
      return;
    }

    const branch = await prisma.branch.create({
      data: {
        code,
        name,
        city,
        address,
        phone,
        email,
        dailyTransactionLimit: parseFloat(dailyTransactionLimit),
        status: "ACTIVE"
      }
    });

    if (req.user) {
      await logAuditEvent(req.user.id, "BRANCH_PROVISION", "ADMINISTRATION", ipAddress, `Provisioned new branch: ${name} (${code})`, "SUCCESS");
    }

    res.status(201).json({ success: true, data: branch });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to provision branch" });
  }
}

export async function updateBranch(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = String(req.params.id);
  const { name, city, address, phone, email, dailyTransactionLimit, status } = req.body;
  const ipAddress = req.ip || "unknown";

  try {
    const branch = await prisma.branch.update({
      where: { id },
      data: {
        name,
        city,
        address,
        phone,
        email,
        dailyTransactionLimit: dailyTransactionLimit !== undefined ? parseFloat(dailyTransactionLimit) : undefined,
        status
      }
    });

    if (req.user) {
      await logAuditEvent(req.user.id, "BRANCH_UPDATE", "ADMINISTRATION", ipAddress, `Updated parameters for branch: ${branch.name} (${branch.code})`, "SUCCESS");
    }

    res.status(200).json({ success: true, data: branch });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to update branch" });
  }
}
