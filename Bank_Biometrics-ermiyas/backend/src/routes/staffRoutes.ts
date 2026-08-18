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
  createHRAccountant
} from "../controllers/staffController.js";

import {
  authenticateJWT,
  requireRole,
  requireBranchAccess
} from "../middleware/auth.js";

const router = Router();

// ──────────────────────────────────────────────
// GET ROUTES
// ──────────────────────────────────────────────

// Get Bank Managers
router.get(
  "/managers",
  authenticateJWT,
  getManagers
);

// Get Accountants
router.get(
  "/accountants",
  authenticateJWT,
  getAccountants
);

// Get Branch IT users
router.get(
  "/branch-it",
  authenticateJWT,
  getBranchIT
);

// ──────────────────────────────────────────────
// SUPER ADMIN READ ROUTES
// ──────────────────────────────────────────────

// Get Super Admin Managers
router.get(
  "/super-admin-managers",
  authenticateJWT,
  requireRole(["SUPER_ADMIN"]),
  getSuperAdminManagers
);

// Get Super Admin IT
router.get(
  "/super-admin-it",
  authenticateJWT,
  requireRole(["SUPER_ADMIN"]),
  getSuperAdminIT
);

// Get Super Admin FOREX
router.get(
  "/super-admin-forex",
  authenticateJWT,
  requireRole(["SUPER_ADMIN"]),
  getSuperAdminFOREX
);

// ──────────────────────────────────────────────
// SUPER ADMIN CREATE ROUTES
// ──────────────────────────────────────────────

// Super Admin creates another Super Admin role
router.post(
  "/super-admin-role",
  authenticateJWT,
  requireRole(["SUPER_ADMIN"]),
  createSuperAdminRole
);

// Super Admin creates Bank Manager
router.post(
  "/bank-manager",
  authenticateJWT,
  requireRole(["SUPER_ADMIN"]),
  createBankManager
);

// ──────────────────────────────────────────────
// ACCOUNTANT ROUTES
// ──────────────────────────────────────────────

// Super Admin / Bank Manager / HR creates Accountant
//
// IMPORTANT:
// We do NOT use requireBranchAccess here because HR
// must be allowed to select the target branch when
// creating an Accountant.
router.post(
  "/accountant",
  authenticateJWT,
  requireRole(["SUPER_ADMIN", "BANK_MANAGER", "HR"]),
  createAccountant
);

// HR creates Accountant request.
// The request will be sent to Bank Manager for approval.
router.post(
  "/hr-accountant",
  authenticateJWT,
  requireRole(["HR"]),
  createHRAccountant
);

// ──────────────────────────────────────────────
// BRANCH IT ROUTES
// ──────────────────────────────────────────────

// Super Admin / Bank Manager creates Branch IT
router.post(
  "/branch-it",
  authenticateJWT,
  requireRole(["SUPER_ADMIN", "BANK_MANAGER"]),
  requireBranchAccess,
  createBranchIT
);

// ──────────────────────────────────────────────
// GENERIC STAFF CRUD
// ──────────────────────────────────────────────

// Super Admin creates generic staff
router.post(
  "/",
  authenticateJWT,
  requireRole(["SUPER_ADMIN"]),
  createStaff
);

// Get individual staff member
router.get(
  "/:id",
  authenticateJWT,
  getStaffDetails
);

// Super Admin / Bank Manager updates staff
router.put(
  "/:id",
  authenticateJWT,
  requireRole(["SUPER_ADMIN", "BANK_MANAGER"]),
  updateStaff
);

export default router;