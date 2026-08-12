import { Router } from "express";
import {
  getPendingApprovals,
  getAllApprovals,
  createApprovalRequest,
  approveRequest,
  rejectRequest,
  getApprovalCounts
} from "../controllers/approvalController.js";
import { authenticateJWT, requireRole } from "../middleware/auth.js";

const router = Router();

// All approval routes require authentication
router.use(authenticateJWT);

// Get pending approvals (role-filtered automatically)
router.get("/pending", getPendingApprovals);

// Get all approvals (Super Admin only)
router.get("/all", requireRole(["SUPER_ADMIN"]), getAllApprovals);

// Get approval counts (for badges)
router.get("/counts", getApprovalCounts);

// Create an approval request
router.post("/", createApprovalRequest);

// Approve a request (Super Admin for high-level, Bank Manager for branch-level)
router.put("/:id/approve", requireRole(["SUPER_ADMIN", "SUPER_ADMIN_MANAGER", "BANK_MANAGER"]), approveRequest);

// Reject a request
router.put("/:id/reject", requireRole(["SUPER_ADMIN", "SUPER_ADMIN_MANAGER", "BANK_MANAGER"]), rejectRequest);

export default router;

