import { Router } from "express";
import { authenticateJWT as authenticate, requireRole as authorize } from "../middleware/auth.js";
import { registerDevice, pingDevice, getDevices, updateDeviceStatus } from "../controllers/deviceController.js";

const router = Router();

// Device calls this endpoint (Custom Auth inside controller)
router.post("/ping", pingDevice);

// IT Admin Endpoints
router.use(authenticate);

router.post("/register", authorize(["SUPER_ADMIN", "SUPER_ADMIN_IT", "BRANCH_IT"]), registerDevice);
router.get("/", authorize(["SUPER_ADMIN", "SUPER_ADMIN_IT", "BRANCH_IT", "BANK_MANAGER"]), getDevices);
router.patch("/:id/status", authorize(["SUPER_ADMIN", "SUPER_ADMIN_IT", "BRANCH_IT"]), updateDeviceStatus);

export default router;
