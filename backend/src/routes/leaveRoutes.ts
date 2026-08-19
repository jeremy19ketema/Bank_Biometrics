import { Router } from "express";
import { authenticateJWT as authenticate, requireRole as authorize } from "../middleware/auth.js";
import { requestLeave, approveLeave, requestOvertime, approveOvertime, getLeaveRequests, getOvertimeRequests } from "../controllers/leaveController.js";

const router = Router();

router.use(authenticate);

// Leave
router.get("/", authorize(["SUPER_ADMIN", "HR", "BANK_MANAGER", "AUDITOR"]), getLeaveRequests);
router.post("/", requestLeave);
router.patch("/:id/approve", authorize(["SUPER_ADMIN", "HR", "BANK_MANAGER"]), approveLeave);

// Overtime
router.get("/overtime", authorize(["SUPER_ADMIN", "HR", "BANK_MANAGER", "AUDITOR"]), getOvertimeRequests);
router.post("/overtime", requestOvertime);
router.patch("/overtime/:id/approve", authorize(["SUPER_ADMIN", "HR", "BANK_MANAGER"]), approveOvertime);

export default router;
