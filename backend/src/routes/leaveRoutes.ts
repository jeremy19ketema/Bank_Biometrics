import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { requestLeave, approveLeave, requestOvertime, approveOvertime } from "../controllers/leaveController.js";

const router = Router();

router.use(authenticate);

// Leave
router.post("/", requestLeave);
router.patch("/:id/approve", authorize(["SUPER_ADMIN", "HR", "BANK_MANAGER"]), approveLeave);

// Overtime
router.post("/overtime", requestOvertime);
router.patch("/overtime/:id/approve", authorize(["SUPER_ADMIN", "HR", "BANK_MANAGER"]), approveOvertime);

export default router;
