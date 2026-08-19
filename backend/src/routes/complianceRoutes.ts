import { Router } from "express";
import { authenticateJWT as authenticate, requireRole as authorize } from "../middleware/auth.js";
import { getCourses, assignCompliance, verifyCompliance, getStaffCompliance } from "../controllers/complianceController.js";

const router = Router();

router.use(authenticate);

router.get("/courses", getCourses);
router.post("/assign", authorize(["HR", "SUPER_ADMIN", "BANK_MANAGER"]), assignCompliance);
router.patch("/:id/verify", authorize(["HR", "SUPER_ADMIN", "BANK_MANAGER", "BRANCH_IT", "SUPER_ADMIN_IT"]), verifyCompliance);
router.get("/staff", authorize(["HR", "SUPER_ADMIN", "BANK_MANAGER", "AUDITOR"]), getStaffCompliance);

export default router;
