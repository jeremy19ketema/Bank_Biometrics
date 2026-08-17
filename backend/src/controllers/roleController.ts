import { Response } from "express";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { logAuditEvent } from "../utils/audit.js";

// --- CUSTOM ROLES ---

export async function createCustomRole(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { name, description, permissions } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!name) {
    res.status(400).json({ success: false, message: "Role name is required." });
    return;
  }

  try {
    const existing = await prisma.customRole.findUnique({ where: { name } });
    if (existing) {
      res.status(400).json({ success: false, message: `Role ${name} already exists.` });
      return;
    }

    const role = await prisma.customRole.create({
      data: { name, description }
    });

    if (req.user) {
      await logAuditEvent(req.user.id, "ROLE_CREATE", "ADMINISTRATION", ipAddress, `Created Custom Role: ${name}`, "SUCCESS");
    }

    res.status(201).json({ success: true, data: role });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create custom role." });
  }
}

export async function getCustomRoles(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const roles = await prisma.customRole.findMany({
      include: {
        permissions: true,
        _count: {
          select: { users: true }
        }
      },
      orderBy: { name: "asc" }
    });
    res.status(200).json({ success: true, data: roles });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch custom roles." });
  }
}

// --- ASSIGNMENTS ---

export async function assignCustomRole(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { userId, customRoleId, scopeType, scopeId } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!userId || !customRoleId || !scopeType || !scopeId) {
    res.status(400).json({ success: false, message: "userId, customRoleId, scopeType, and scopeId are required." });
    return;
  }

  const validScopeTypes = ["ORGANIZATION", "REGION", "BRANCH", "DEPARTMENT"];
  if (!validScopeTypes.includes(scopeType)) {
    res.status(400).json({ success: false, message: "Invalid scopeType." });
    return;
  }

  try {
    // 1. Validate Scope ID exists in DB
    let scopeExists = false;
    if (scopeType === "ORGANIZATION") {
      scopeExists = (await prisma.organization.count({ where: { id: scopeId } })) > 0;
    } else if (scopeType === "REGION") {
      scopeExists = (await prisma.region.count({ where: { id: scopeId } })) > 0;
    } else if (scopeType === "BRANCH") {
      scopeExists = (await prisma.branch.count({ where: { id: scopeId } })) > 0;
    } else if (scopeType === "DEPARTMENT") {
      scopeExists = (await prisma.department.count({ where: { id: scopeId } })) > 0;
    }

    if (!scopeExists) {
      if (req.user) {
        await logAuditEvent(req.user.id, "ROLE_ASSIGN_REJECTED", "SECURITY", ipAddress, `Attempted to assign role with invalid ${scopeType} ID: ${scopeId}`, "WARNING");
      }
      res.status(400).json({ success: false, message: `The specified ${scopeType} does not exist.` });
      return;
    }

    // 2. Prevent assigner from granting permissions beyond their scope
    if (req.user?.role !== "SUPER_ADMIN") {
      const assigner = await prisma.user.findUnique({
        where: { id: req.user!.id },
        include: { customRoles: true }
      });

      let isAllowed = false;

      // Direct scope matches
      if (scopeType === "BRANCH" && assigner?.branchId === scopeId) isAllowed = true;
      if (scopeType === "DEPARTMENT" && assigner?.departmentId === scopeId) isAllowed = true;

      // Encapsulation checks
      if (!isAllowed) {
        if (scopeType === "REGION") {
          // Can only be assigned by SUPER_ADMIN or someone with ORGANIZATION scope matching this region's org
          const region = await prisma.region.findUnique({ where: { id: scopeId }});
          if (region) {
            const hasOrgScope = assigner?.customRoles.some(cr => cr.scopeType === "ORGANIZATION" && cr.scopeId === region.organizationId);
            if (hasOrgScope) isAllowed = true;
          }
        } else if (scopeType === "BRANCH") {
          // Can be assigned by someone with REGION scope matching this branch's region, or ORG scope matching its org
          const branch = await prisma.branch.findUnique({ where: { id: scopeId }, include: { region: true }});
          if (branch?.region) {
            const hasRegionScope = assigner?.customRoles.some(cr => cr.scopeType === "REGION" && cr.scopeId === branch.regionId);
            const hasOrgScope = assigner?.customRoles.some(cr => cr.scopeType === "ORGANIZATION" && cr.scopeId === branch.region!.organizationId);
            if (hasRegionScope || hasOrgScope) isAllowed = true;
          }
        } else if (scopeType === "DEPARTMENT") {
          // Can be assigned by someone with ORG, REGION, or BRANCH scope matching the department's parent
          const dept = await prisma.department.findUnique({ where: { id: scopeId }});
          if (dept) {
            if (dept.organizationId && assigner?.customRoles.some(cr => cr.scopeType === "ORGANIZATION" && cr.scopeId === dept.organizationId)) isAllowed = true;
            if (dept.regionId && assigner?.customRoles.some(cr => cr.scopeType === "REGION" && cr.scopeId === dept.regionId)) isAllowed = true;
            if (dept.branchId && assigner?.customRoles.some(cr => cr.scopeType === "BRANCH" && cr.scopeId === dept.branchId)) isAllowed = true;
            // Also if assigner is manager of that specific branch
            if (dept.branchId && assigner?.branchId === dept.branchId) isAllowed = true;
          }
        }
      }

      if (!isAllowed) {
        await logAuditEvent(req.user!.id, "ROLE_ASSIGN_FORBIDDEN", "SECURITY", ipAddress, `Attempted to assign role outside permitted scope. Target: ${scopeType} ${scopeId}`, "WARNING");
        res.status(403).json({ success: false, message: "You do not have permission to assign roles in this scope." });
        return;
      }
    }

    // Assign the role
    const assignment = await prisma.userCustomRole.create({
      data: {
        userId,
        customRoleId,
        scopeType,
        scopeId,
        assignedById: req.user?.id
      }
    });

    if (req.user) {
      await logAuditEvent(req.user.id, "ROLE_ASSIGN", "ADMINISTRATION", ipAddress, `Assigned CustomRole ${customRoleId} to User ${userId} at ${scopeType} level (${scopeId})`, "SUCCESS");
    }

    res.status(201).json({ success: true, data: assignment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to assign role." });
  }
}
