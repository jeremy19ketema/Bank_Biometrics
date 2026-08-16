import { Response } from "express";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { logAuditEvent } from "../utils/audit.js";

// --- ORGANIZATIONS ---

export async function createOrganization(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { name, code, status } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!name || !code) {
    res.status(400).json({ success: false, message: "Name and code are required." });
    return;
  }

  try {
    const existing = await prisma.organization.findUnique({ where: { code } });
    if (existing) {
      res.status(400).json({ success: false, message: `Organization code ${code} is already in use.` });
      return;
    }

    const org = await prisma.organization.create({
      data: { name, code, status: status || "ACTIVE" }
    });

    if (req.user) {
      await logAuditEvent(req.user.id, "ORG_CREATE", "ADMINISTRATION", ipAddress, `Created Organization: ${name} (${code})`, "SUCCESS");
    }

    res.status(201).json({ success: true, data: org });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create organization." });
  }
}

export async function getOrganizations(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const orgs = await prisma.organization.findMany({
      include: {
        regions: {
          include: {
            branches: true
          }
        }
      },
      orderBy: { name: "asc" }
    });
    res.status(200).json({ success: true, data: orgs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch organizations." });
  }
}

// --- REGIONS ---

export async function createRegion(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { name, code, organizationId, status } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!name || !code || !organizationId) {
    res.status(400).json({ success: false, message: "Name, code, and organizationId are required." });
    return;
  }

  try {
    const existing = await prisma.region.findUnique({ where: { code } });
    if (existing) {
      res.status(400).json({ success: false, message: `Region code ${code} is already in use.` });
      return;
    }

    const region = await prisma.region.create({
      data: { name, code, organizationId, status: status || "ACTIVE" }
    });

    if (req.user) {
      await logAuditEvent(req.user.id, "REGION_CREATE", "ADMINISTRATION", ipAddress, `Created Region: ${name} (${code}) for Org: ${organizationId}`, "SUCCESS");
    }

    res.status(201).json({ success: true, data: region });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create region." });
  }
}

// --- DEPARTMENTS ---

export async function createDepartment(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { name, code, status } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!name || !code) {
    res.status(400).json({ success: false, message: "Name and code are required." });
    return;
  }

  try {
    const existing = await prisma.department.findUnique({ where: { code } });
    if (existing) {
      res.status(400).json({ success: false, message: `Department code ${code} is already in use.` });
      return;
    }

    const dept = await prisma.department.create({
      data: { name, code, status: status || "ACTIVE" }
    });

    if (req.user) {
      await logAuditEvent(req.user.id, "DEPARTMENT_CREATE", "ADMINISTRATION", ipAddress, `Created Department: ${name} (${code})`, "SUCCESS");
    }

    res.status(201).json({ success: true, data: dept });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create department." });
  }
}

export async function getDepartments(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const depts = await prisma.department.findMany({
      orderBy: { name: "asc" }
    });
    res.status(200).json({ success: true, data: depts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch departments." });
  }
}

// --- TREE HIERARCHY ---
export async function getHierarchyTree(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const tree = await prisma.organization.findMany({
      include: {
        regions: {
          include: {
            branches: true
          }
        }
      },
      orderBy: { name: "asc" }
    });
    
    // Departments are global entities in this schema but can be linked to users within branches/regions.
    const departments = await prisma.department.findMany({ orderBy: { name: "asc" } });

    res.status(200).json({ 
      success: true, 
      data: {
        organizations: tree,
        departments
      } 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch hierarchy tree." });
  }
}
