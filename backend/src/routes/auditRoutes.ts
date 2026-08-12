import { Router } from "express";
import { getAuditLogs, getSecurityMetrics } from "../controllers/auditController.js";
import { authenticateJWT, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/logs", authenticateJWT, requireRole(["SUPER_ADMIN", "SUPER_ADMIN_IT"]), getAuditLogs);
router.get("/metrics", authenticateJWT, requireRole(["SUPER_ADMIN", "SUPER_ADMIN_IT"]), getSecurityMetrics);

export default router;
