import { Router } from "express";
import { authenticateJWT as authenticate, requireRole as authorize } from "../middleware/auth.js";
import { clockInOut, requestCorrection, processCorrection, getAttendanceEvents } from "../controllers/attendanceController.js";

const router = Router();

// Device endpoint (Auth handled inside controller)
router.post("/clock", clockInOut);

// Dashboard Endpoints
router.use(authenticate);

router.post("/correction", authorize(["SUPER_ADMIN", "HR", "BANK_MANAGER"]), requestCorrection);
router.patch("/correction/:id/approve", authorize(["SUPER_ADMIN", "HR", "BANK_MANAGER"]), processCorrection);
router.get("/", authorize(["SUPER_ADMIN", "HR", "BANK_MANAGER"]), getAttendanceEvents);

export default router;
