import { Router } from "express";
import { escalateAlert, checkSystemStatus } from "../controllers/systemController.js";
import { authenticateJWT, requireRoles } from "../middleware/auth.js";

const router = Router();

// Incident response and alert escalation
router.post("/incidents/:alertId/escalate", authenticateJWT, requireRoles(["SUPER_ADMIN", "SUPER_ADMIN_MANAGER", "SUPER_ADMIN_IT"]), escalateAlert);

// Integration and device uptime monitoring
router.get("/status", authenticateJWT, requireRoles(["SUPER_ADMIN", "SUPER_ADMIN_IT", "BRANCH_IT", "AUDITOR"]), checkSystemStatus);

export default router;
