import { Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { logAuditEvent } from "../utils/audit.js";

// ──────────────────────────────────────────────
// GET ROUTES
// ──────────────────────────────────────────────

export async function getManagers(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const managers = await prisma.user.findMany({
      where: { role: "BANK_MANAGER" },
      include: { branch: true },
      orderBy: { fullName: "asc" }
    });

    const formattedManagers = managers.map(m => ({
      id: m.id,
      employeeId: `EMP-${m.username.toUpperCase()}`,
      fullName: m.fullName,
      email: m.email,
      phone: "+251911000222",
      branchId: m.branchId || "Unassigned",
      branchName: m.branch?.name || "Unassigned",
      status: m.status,
      isFirstLogin: m.isFirstLogin,
      assignedDate: m.createdAt.toISOString()
    }));

    res.status(200).json({ success: true, data: formattedManagers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve managers" });
  }
}

export async function getAccountants(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const accountants = await prisma.user.findMany({
      where: { role: "ACCOUNTANT" },
      include: {
        branch: true,
        _count: {
          select: { processedTransactions: true }
        }
      },
      orderBy: { fullName: "asc" }
    });

    const formattedAccountants = accountants.map(a => ({
      id: a.id,
      employeeId: `EMP-${a.username.toUpperCase()}`,
      fullName: a.fullName,
      email: a.email,
      phone: "+251911000333",
      branchId: a.branchId || "Unassigned",
      branchName: a.branch?.name || "Unassigned",
      tillNumber: `TILL-0${a.username.charCodeAt(a.username.length - 1) % 9 || 1}`,
      status: a.status,
      isFirstLogin: a.isFirstLogin,
      isActive: a.isActive,
      dailyProcessedVolume: a._count.processedTransactions * 12500,
      verificationSuccessRate: 98.5
    }));

    res.status(200).json({ success: true, data: formattedAccountants });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve accountants" });
  }
}

export async function getBranchIT(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const branchITUsers = await prisma.user.findMany({
      where: { role: "BRANCH_IT" },
      include: { branch: true },
      orderBy: { fullName: "asc" }
    });

    const formatted = branchITUsers.map(u => ({
      id: u.id,
      employeeId: `EMP-${u.username.toUpperCase()}`,
      fullName: u.fullName,
      email: u.email,
      phone: "+251911000444",
      branchId: u.branchId || "Unassigned",
      branchName: u.branch?.name || "Unassigned",
      status: u.status,
      isFirstLogin: u.isFirstLogin,
      lastLogin: u.lastLoginAt,
      createdAt: u.createdAt
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve branch IT users" });
  }
}

export async function getSuperAdminManagers(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      where: { role: "SUPER_ADMIN_MANAGER" },
      orderBy: { fullName: "asc" }
    });

    res.status(200).json({
      success: true,
      data: users.map(u => ({
        id: u.id,
        username: u.username,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        status: u.status,
        isFirstLogin: u.isFirstLogin,
        isActive: u.isActive,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve Super Admin Managers" });
  }
}

export async function getSuperAdminIT(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      where: { role: "SUPER_ADMIN_IT" },
      orderBy: { fullName: "asc" }
    });

    res.status(200).json({
      success: true,
      data: users.map(u => ({
        id: u.id,
        username: u.username,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        status: u.status,
        isFirstLogin: u.isFirstLogin,
        isActive: u.isActive,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve Super Admin IT users" });
  }
}

export async function getSuperAdminFOREX(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      where: { role: "SUPER_ADMIN_FOREX" },
      orderBy: { fullName: "asc" }
    });

    res.status(200).json({
      success: true,
      data: users.map(u => ({
        id: u.id,
        username: u.username,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        status: u.status,
        isFirstLogin: u.isFirstLogin,
        isActive: u.isActive,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve Super Admin FOREX users" });
  }
}

export async function getHR(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const hrUsers = await prisma.user.findMany({
      where: { role: "HR" },
      include: { branch: true },
      orderBy: { fullName: "asc" }
    });

    const formatted = hrUsers.map(u => ({
      id: u.id,
      employeeId: `EMP-${u.username.toUpperCase()}`,
      fullName: u.fullName,
      email: u.email,
      phone: "+251911000555",
      branchId: u.branchId || "Unassigned",
      branchName: u.branch?.name || "Unassigned",
      status: u.status,
      isFirstLogin: u.isFirstLogin,
      isActive: u.isActive,
      lastLogin: u.lastLoginAt,
      createdAt: u.createdAt
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve HR users" });
  }
}
// ──────────────────────────────────────────────
// CREATE ROUTES
// ──────────────────────────────────────────────

// Super Admin creates Bank Manager (goes through approval)
export async function createBankManager(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { username, fullName, email, branchId, passcode } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!username || !fullName || !email || !passcode) {
    res.status(400).json({ success: false, message: "Missing required fields" });
    return;
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] }
    });
    if (existingUser) {
      res.status(400).json({ success: false, message: "Username or email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(passcode, 10);

    const user = await prisma.user.create({
      data: {
        username,
        fullName,
        email,
        passwordHash,
        role: "BANK_MANAGER",
        branchId: branchId || null,
        isActive: true,
        status: "PENDING_APPROVAL",
        isFirstLogin: true
      }
    });

    // Create approval request for the new Bank Manager
    await prisma.approvalRequest.create({
      data: {
        requestType: "CREATE_BANK_MANAGER",
        requestedById: req.user!.id,
        requestedByName: req.user!.username,
        targetUserId: user.id,
        targetRole: "BANK_MANAGER",
        targetBranchId: branchId || null,
        details: `Creation of Bank Manager: ${fullName} (${username})`,
        status: "PENDING"
      }
    });

    if (req.user) {
      await logAuditEvent(req.user.id, "BANK_MANAGER_CREATE_PENDING", "ADMINISTRATION", ipAddress, `Bank Manager creation pending approval: ${fullName}`, "SUCCESS");
    }

    res.status(201).json({
      success: true,
      message: "Bank Manager created and pending approval. Once approved, the manager will receive their credentials.",
      data: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        branchId: user.branchId,
        status: user.status
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create Bank Manager" });
  }
}

// Bank Manager creates Accountant (branch-level)
export async function createAccountant(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { username, fullName, email, passcode } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  if (!username || !fullName || !email || !passcode) {
    res.status(400).json({ success: false, message: "Missing required fields" });
    return;
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] }
    });
    if (existingUser) {
      res.status(400).json({ success: false, message: "Username or email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(passcode, 10);

    const user = await prisma.user.create({
      data: {
        username,
        fullName,
        email,
        passwordHash,
        role: "ACCOUNTANT",
        branchId: req.user.branchId || null,
        isActive: true,
        status: "PENDING_FIRST_LOGIN",
        isFirstLogin: true
      }
    });

    if (req.user) {
      await logAuditEvent(req.user.id, "ACCOUNTANT_CREATE", "ADMINISTRATION", ipAddress, `Created Accountant: ${fullName} for branch: ${req.user.branchId}`, "SUCCESS");
    }

    res.status(201).json({
      success: true,
      message: "Accountant created successfully. Temporary credentials provided.",
      data: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        branchId: user.branchId,
        status: user.status
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create Accountant" });
  }
}

// Bank Manager creates Branch IT (branch-level)
export async function createBranchIT(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { username, fullName, email, passcode } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  if (!username || !fullName || !email || !passcode) {
    res.status(400).json({ success: false, message: "Missing required fields" });
    return;
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] }
    });
    if (existingUser) {
      res.status(400).json({ success: false, message: "Username or email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(passcode, 10);

    const user = await prisma.user.create({
      data: {
        username,
        fullName,
        email,
        passwordHash,
        role: "BRANCH_IT",
        branchId: req.user.branchId || null,
        isActive: true,
        status: "PENDING_FIRST_LOGIN",
        isFirstLogin: true
      }
    });

    if (req.user) {
      await logAuditEvent(req.user.id, "BRANCH_IT_CREATE", "ADMINISTRATION", ipAddress, `Created Branch IT: ${fullName} for branch: ${req.user.branchId}`, "SUCCESS");
    }

    res.status(201).json({
      success: true,
      message: "Branch IT user created successfully.",
      data: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        branchId: user.branchId,
        status: user.status
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create Branch IT user" });
  }
}

// Super Admin creates Super Admin roles (goes through approval)
export async function createSuperAdminRole(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { username, fullName, email, role, passcode } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!username || !fullName || !email || !role || !passcode) {
    res.status(400).json({ success: false, message: "Missing required fields" });
    return;
  }

  const allowedRoles = ["SUPER_ADMIN", "SUPER_ADMIN_MANAGER", "SUPER_ADMIN_IT", "SUPER_ADMIN_FOREX"];
  if (!allowedRoles.includes(role)) {
    res.status(400).json({ success: false, message: `Invalid Super Admin role. Allowed: ${allowedRoles.join(", ")}` });
    return;
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] }
    });
    if (existingUser) {
      res.status(400).json({ success: false, message: "Username or email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(passcode, 10);

    const user = await prisma.user.create({
      data: {
        username,
        fullName,
        email,
        passwordHash,
        role: role as any,
        isActive: true,
        status: "PENDING_FIRST_LOGIN",
        isFirstLogin: true
      }
    });

    if (req.user) {
      await logAuditEvent(req.user.id, "SUPER_ADMIN_ROLE_CREATE", "ADMINISTRATION", ipAddress, `Created ${role}: ${fullName}`, "SUCCESS");
    }

    res.status(201).json({
      success: true,
      message: `${role.replace("_", " ")} created successfully.`,
      data: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create Super Admin role" });
  }
}

// HR creates users (goes through approval by Super Admin Manager)
export async function createHR(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { username, fullName, email, role, branchId, passcode } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  // HR can only create specific roles
  const allowedRolesForHR = ["BANK_MANAGER", "BRANCH_IT", "ACCOUNTANT", "SUPER_ADMIN_IT", "SUPER_ADMIN_FOREX"];
  if (!allowedRolesForHR.includes(role)) {
    res.status(403).json({ 
      success: false, 
      message: `HR cannot create role: ${role}. Allowed roles: ${allowedRolesForHR.join(", ")}` 
    });
    return;
  }

  // HR cannot create SUPER_ADMIN or SUPER_ADMIN_MANAGER (blocked by allowedRolesForHR)

  if (!username || !fullName || !email || !passcode) {
    res.status(400).json({ success: false, message: "Missing required fields" });
    return;
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] }
    });
    if (existingUser) {
      res.status(400).json({ success: false, message: "Username or email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(passcode, 10);

    // Create user with PENDING_APPROVAL status (HR-created users need approval)
    const user = await prisma.user.create({
      data: {
        username,
        fullName,
        email,
        passwordHash,
        role: role as any,
        branchId: branchId || null,
        isActive: true,
        status: "PENDING_APPROVAL",
        isFirstLogin: true
      }
    });

    // Create approval request
    await prisma.approvalRequest.create({
      data: {
        requestType: `CREATE_${role}`,
        requestedById: req.user.id,
        requestedByName: req.user.username,
        targetUserId: user.id,
        targetRole: role as any,
        targetBranchId: branchId || null,
        details: `HR created ${role}: ${fullName} (${username})`,
        status: "PENDING"
      }
    });

    await logAuditEvent(
      req.user.id,
      "HR_USER_CREATE_PENDING",
      "ADMINISTRATION",
      ipAddress,
      `HR created ${role} pending approval: ${fullName}`,
      "SUCCESS"
    );

    res.status(201).json({
      success: true,
      message: `${role.replace("_", " ")} created and pending approval by Super Admin Manager.`,
      data: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        branchId: user.branchId,
        status: user.status
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create user" });
  }
}
// ──────────────────────────────────────────────
// GENERIC STAFF CRUD
// ──────────────────────────────────────────────

export async function createStaff(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { username, fullName, email, role, branchId, passcode, department } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  // If HR is creating, block SUPER_ADMIN and SUPER_ADMIN_MANAGER
  if (req.user.role === "HR") {
    const blockedRoles = ["SUPER_ADMIN", "SUPER_ADMIN_MANAGER"];
    if (blockedRoles.includes(role)) {
      res.status(403).json({ 
        success: false, 
        message: `HR cannot create ${role}. This role requires Super Admin privileges.` 
      });
      return;
    }
  }

  if (!username || !fullName || !email || !role || !passcode) {
    res.status(400).json({ success: false, message: "Missing required personnel fields" });
    return;
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }]
      }
    });

    if (existingUser) {
      res.status(400).json({ success: false, message: "Username or email already exists in bank system" });
      return;
    }

    const passwordHash = await bcrypt.hash(passcode, 10);

    // Determine status based on creator's role
    // HR-created users go to PENDING_APPROVAL (needs Super Admin Manager approval)
    // Super Admin / Super Admin Manager created users go to PENDING_FIRST_LOGIN
    const isHRCreating = req.user.role === "HR";
    const userStatus = isHRCreating ? "PENDING_APPROVAL" : "PENDING_FIRST_LOGIN";

    const user = await prisma.user.create({
      data: {
        username,
        fullName,
        email,
        passwordHash,
        role: role as any,
        branchId: branchId || null,
        department: department || null,
        isActive: true,
        status: userStatus,
        isFirstLogin: true
      }
    });

    // If HR created this user, create an approval request
    if (isHRCreating) {
      await prisma.approvalRequest.create({
        data: {
          requestType: `CREATE_${role}`,
          requestedById: req.user.id,
          requestedByName: req.user.username,
          targetUserId: user.id,
          targetRole: role as any,
          targetBranchId: branchId || null,
          details: `HR created ${role}: ${fullName} (${username})`,
          status: "PENDING"
        }
      });

      await logAuditEvent(
        req.user.id,
        "HR_USER_CREATE_PENDING",
        "ADMINISTRATION",
        ipAddress,
        `HR created ${role} pending approval: ${fullName}`,
        "SUCCESS"
      );

      res.status(201).json({
        success: true,
        message: `${role.replace("_", " ")} created and pending approval by Super Admin Manager.`,
        data: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          branchId: user.branchId,
          status: user.status
        }
      });
    } else {
      // Super Admin or Super Admin Manager created user directly
      await logAuditEvent(
        req.user.id, 
        "STAFF_CREATE", 
        "ADMINISTRATION", 
        ipAddress, 
        `Created new staff member: ${fullName} as ${role} for branch: ${branchId || 'None'}`, 
        "SUCCESS"
      );

      res.status(201).json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          branchId: user.branchId,
          isActive: user.isActive,
          status: user.status,
          isFirstLogin: user.isFirstLogin
        }
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create staff member" });
  }
}

export async function getStaffDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = String(req.params.id);

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { branch: true }
    });

    if (!user) {
      res.status(404).json({ success: false, message: "Staff member not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        branchId: user.branchId,
        branchName: user.branch?.name || "Unassigned",
        status: user.status,
        isActive: user.isActive,
        isFirstLogin: user.isFirstLogin,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve staff details" });
  }
}

export async function updateStaff(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = String(req.params.id);
  const { fullName, email, branchId, status, isActive } = req.body;
  const ipAddress = req.ip || "unknown";

  try {
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      res.status(404).json({ success: false, message: "Staff member not found" });
      return;
    }

    // Bank Manager can only update users in their own branch
    if (req.user && req.user.role === "BANK_MANAGER") {
      if (targetUser.branchId !== req.user.branchId) {
        res.status(403).json({ success: false, message: "Access denied: you can only manage users in your assigned branch" });
        return;
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        fullName: fullName ?? undefined,
        email: email ?? undefined,
        branchId: branchId ?? undefined,
        status: status ?? undefined,
        isActive: isActive ?? undefined
      }
    });

    if (req.user) {
      await logAuditEvent(req.user.id, "STAFF_UPDATE", "ADMINISTRATION", ipAddress, `Updated profile for staff member: ${updated.fullName}`, "SUCCESS");
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to update staff profile" });
  }
}

export async function updateHR(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = String(req.params.id);
  const { fullName, email, branchId, status, isActive } = req.body;
  const ipAddress = req.ip || "unknown";

  try {
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      res.status(404).json({ success: false, message: "HR user not found" });
      return;
    }

    // Only Super Admin or Super Admin Manager can update HR users
    if (req.user && req.user.role !== "SUPER_ADMIN" && req.user.role !== "SUPER_ADMIN_MANAGER") {
      res.status(403).json({ success: false, message: "Access denied: Only Super Admin or Super Admin Manager can update HR users" });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        fullName: fullName ?? undefined,
        email: email ?? undefined,
        branchId: branchId ?? undefined,
        status: status ?? undefined,
        isActive: isActive ?? undefined
      }
    });

    if (req.user) {
      await logAuditEvent(
        req.user.id, 
        "HR_UPDATE", 
        "ADMINISTRATION", 
        ipAddress, 
        `Updated HR profile for: ${updated.fullName}`, 
        "SUCCESS"
      );
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to update HR user" });
  }
}

export async function getHRDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = String(req.params.id);

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { branch: true }
    });

    if (!user) {
      res.status(404).json({ success: false, message: "HR user not found" });
      return;
    }

    if (user.role !== "HR") {
      res.status(404).json({ success: false, message: "User is not an HR staff member" });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        branchId: user.branchId,
        branchName: user.branch?.name || "Unassigned",
        status: user.status,
        isActive: user.isActive,
        isFirstLogin: user.isFirstLogin,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve HR details" });
  }
}

// ──────────────────────────────────────────────
// DELETE ROUTES
// ──────────────────────────────────────────────

export async function deleteStaff(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = String(req.params.id);
  const ipAddress = req.ip || "unknown";

  try {
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      res.status(404).json({ success: false, message: "Staff member not found" });
      return;
    }

    // Authorization checks
    if (req.user?.role === "BANK_MANAGER") {
      if (targetUser.branchId !== req.user.branchId) {
        res.status(403).json({ success: false, message: "Access denied" });
        return;
      }
    }

    await prisma.user.delete({ where: { id } });

    if (req.user) {
      await logAuditEvent(req.user.id, "STAFF_DELETE", "ADMINISTRATION", ipAddress, `Deleted staff member: ${targetUser.fullName}`, "SUCCESS");
    }

    res.status(200).json({ success: true, message: "Staff member deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to delete staff member" });
  }
}

export async function deleteHR(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = String(req.params.id);
  const ipAddress = req.ip || "unknown";

  try {
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      res.status(404).json({ success: false, message: "HR member not found" });
      return;
    }

    if (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "SUPER_ADMIN_MANAGER") {
      res.status(403).json({ success: false, message: "Access denied: Only Super Admin or Super Admin Manager can delete HR users" });
      return;
    }

    await prisma.user.delete({ where: { id } });

    if (req.user) {
      await logAuditEvent(req.user.id, "HR_DELETE", "ADMINISTRATION", ipAddress, `Deleted HR member: ${targetUser.fullName}`, "SUCCESS");
    }

    res.status(200).json({ success: true, message: "HR member deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to delete HR member" });
  }
}