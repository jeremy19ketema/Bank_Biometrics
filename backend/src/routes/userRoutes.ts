import { Router } from "express";
import { 
  getUsers, 
  getUserById, 
  createUser, 
  approveUser, 
  updateUserStatus, 
  generatePasswordReset, 
  assignUserRole 
} from "../controllers/userController.js";
import { authenticateJWT, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticateJWT);

// Listing users
router.get("/", requireRole(["SUPER_ADMIN", "BANK_MANAGER", "HR"]), getUsers);
router.get("/:id", requireRole(["SUPER_ADMIN", "BANK_MANAGER", "HR"]), getUserById);

// Creation and Maker-Checker
router.post("/", requireRole(["SUPER_ADMIN", "HR", "BANK_MANAGER"]), createUser);
router.post("/:id/approve", requireRole(["SUPER_ADMIN", "HR", "BANK_MANAGER"]), approveUser);

// Status and Lifecycle
router.patch("/:id/status", requireRole(["SUPER_ADMIN", "HR"]), updateUserStatus);
router.post("/:id/reset-password", requireRole(["SUPER_ADMIN", "HR", "BRANCH_IT"]), generatePasswordReset);
router.post("/:id/roles", requireRole(["SUPER_ADMIN", "HR", "BANK_MANAGER"]), assignUserRole);

export default router;
