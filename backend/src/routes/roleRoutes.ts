import { Router } from "express";
import { authenticateJWT, requireRole } from "../middleware/auth.js";
import {
  createCustomRole,
  getCustomRoles,
  assignCustomRole
} from "../controllers/roleController.js";

const router = Router();

router.use(authenticateJWT);

// Creating/viewing custom role definitions is restricted to Super Admin
router.post("/custom", requireRole(["SUPER_ADMIN"]), createCustomRole);
router.get("/custom", requireRole(["SUPER_ADMIN", "SUPER_ADMIN_MANAGER", "HR", "BANK_MANAGER"]), getCustomRoles);

// Assigning custom roles is available to lower tier admins (scoping enforced in controller)
router.post("/assign", requireRole(["SUPER_ADMIN", "SUPER_ADMIN_MANAGER", "HR", "BANK_MANAGER"]), assignCustomRole);

export default router;
