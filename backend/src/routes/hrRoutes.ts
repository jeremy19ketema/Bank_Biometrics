import { Router } from "express";
import { authenticateJWT as authenticate, requireRole as authorize } from "../middleware/auth.js";
import { requestOffboarding, approveOffboarding, getPendingApprovals } from "../controllers/hrController.js";

const router = Router();

router.use(authenticate);

// Approvals Queue
router.get("/approvals", authorize(["HR", "SUPER_ADMIN", "SUPER_ADMIN_HR", "BANK_MANAGER"]), getPendingApprovals);

// Offboarding Workflow
router.post("/offboard", authorize(["HR", "SUPER_ADMIN", "SUPER_ADMIN_HR", "BANK_MANAGER"]), requestOffboarding);
router.patch("/offboard/:id/approve", authorize(["HR", "SUPER_ADMIN", "SUPER_ADMIN_HR", "BANK_MANAGER"]), approveOffboarding);

export default router;
