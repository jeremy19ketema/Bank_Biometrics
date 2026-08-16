import { Router } from "express";
import { authenticateJWT, requireRole } from "../middleware/auth.js";
import {
  getAlerts,
  acknowledgeAlert,
  escalateAlert,
  resolveAlert,
  proposePolicyChange,
  approvePolicyChange,
  getSystemHealth
} from "../controllers/securityController.js";

const router = Router();

router.use(authenticateJWT);

// Alerts (Security personnel)
router.get("/alerts", requireRole(["SUPER_ADMIN", "SUPER_ADMIN_IT", "SUPER_ADMIN_MANAGER"]), getAlerts);
router.post("/alerts/:id/acknowledge", requireRole(["SUPER_ADMIN", "SUPER_ADMIN_IT", "SUPER_ADMIN_MANAGER"]), acknowledgeAlert);
router.post("/alerts/:id/escalate", requireRole(["SUPER_ADMIN", "SUPER_ADMIN_IT", "SUPER_ADMIN_MANAGER"]), escalateAlert);
router.post("/alerts/:id/resolve", requireRole(["SUPER_ADMIN", "SUPER_ADMIN_IT", "SUPER_ADMIN_MANAGER"]), resolveAlert);

// Policies (Maker-Checker)
router.post("/policies/propose", requireRole(["SUPER_ADMIN", "SUPER_ADMIN_MANAGER"]), proposePolicyChange);
router.post("/policies/approve/:id", requireRole(["SUPER_ADMIN", "SUPER_ADMIN_MANAGER"]), approvePolicyChange);

// System Health (IT)
router.get("/health", requireRole(["SUPER_ADMIN", "SUPER_ADMIN_IT"]), getSystemHealth);

export default router;
