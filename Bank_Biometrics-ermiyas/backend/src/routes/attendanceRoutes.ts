import { Router } from "express";
import { getAttendance, markAttendance, getAttendanceSummary } from "../controllers/attendanceController.js";
import { authenticateJWT, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticateJWT);

router.get("/", requireRole(["HR", "BANK_MANAGER", "SUPER_ADMIN", "SUPER_ADMIN_MANAGER"]), getAttendance);
router.get("/summary", requireRole(["HR", "BANK_MANAGER", "SUPER_ADMIN", "SUPER_ADMIN_MANAGER"]), getAttendanceSummary);
router.post("/mark", requireRole(["HR", "BANK_MANAGER", "SUPER_ADMIN"]), markAttendance);

export default router;
