import { Router } from "express";
import { authenticateJWT, requireRole } from "../middleware/auth.js";
import {
  createOrganization,
  getOrganizations,
  createRegion,
  createDepartment,
  getDepartments,
  getHierarchyTree
} from "../controllers/orgController.js";

const router = Router();

// Only SUPER_ADMIN can manage the global hierarchy right now
router.use(authenticateJWT);
router.use(requireRole(["SUPER_ADMIN"]));

router.post("/organizations", createOrganization);
router.get("/organizations", getOrganizations);

router.post("/regions", createRegion);

router.post("/departments", createDepartment);
router.get("/departments", getDepartments);

router.get("/tree", getHierarchyTree);

export default router;
