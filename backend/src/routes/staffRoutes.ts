import { Router } from "express";
import {
  getManagers,
  getAccountants,
  createStaff,
  getStaffDetails,
  updateStaff,
  getSuperAdminManagers,
  getSuperAdminIT,
  getSuperAdminFOREX,
  getBranchIT,
  createBankManager,
  createAccountant,
  createBranchIT,
  createSuperAdminRole,
  getHR,
  createHR,
  getHRDetails,
  updateHR
} from "../controllers/staffController.js";
import { authenticateJWT, requireRole, requireBranchAccess } from "../middleware/auth.js";

const router = Router();

// Public (authenticated) read routes
router.get("/managers", authenticateJWT, getManagers);
router.get("/accountants", authenticateJWT, getAccountants);
router.get("/branch-it", authenticateJWT, getBranchIT);

// HR routes (only accessible by Super Admin, Super Admin Manager, or HR)
router.get("/hr", authenticateJWT, requireRole(["SUPER_ADMIN", "SUPER_ADMIN_MANAGER", "HR"]), getHR);
router.get("/hr/:id", authenticateJWT, requireRole(["SUPER_ADMIN", "SUPER_ADMIN_MANAGER", "HR"]), getHRDetails);
router.post("/hr", authenticateJWT, requireRole(["HR"]), createHR);  // HR creates users
router.put("/hr/:id", authenticateJWT, requireRole(["SUPER_ADMIN", "SUPER_ADMIN_MANAGER"]), updateHR);

// Super Admin role-specific read routes
router.get("/super-admin-managers", authenticateJWT, requireRole(["SUPER_ADMIN"]), getSuperAdminManagers);
router.get("/super-admin-it", authenticateJWT, requireRole(["SUPER_ADMIN"]), getSuperAdminIT);
router.get("/super-admin-forex", authenticateJWT, requireRole(["SUPER_ADMIN"]), getSuperAdminFOREX);

// Super Admin - create any Super Admin role
router.post("/super-admin-role", authenticateJWT, requireRole(["SUPER_ADMIN"]), createSuperAdminRole);

// Super Admin - create Bank Manager (requires high-level approval)
router.post("/bank-manager", authenticateJWT, requireRole(["SUPER_ADMIN"]), createBankManager);

// Bank Manager - create Accountant (branch-level)
router.post("/accountant", authenticateJWT, requireRole(["SUPER_ADMIN", "BANK_MANAGER"]), requireBranchAccess, createAccountant);

// Bank Manager - create Branch IT (branch-level)
router.post("/branch-it", authenticateJWT, requireRole(["SUPER_ADMIN", "BANK_MANAGER"]), requireBranchAccess, createBranchIT);

// Generic staff CRUD
router.post("/", authenticateJWT, requireRole(["SUPER_ADMIN"]), createStaff);
router.get("/:id", authenticateJWT, getStaffDetails);
router.put("/:id", authenticateJWT, requireRole(["SUPER_ADMIN", "BANK_MANAGER"]), updateStaff);

export default router;
