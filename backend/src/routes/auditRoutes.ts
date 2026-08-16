import { Router } from "express";
import { getAuditLogs, getSecurityMetrics, exportAuditLogs } from "../controllers/auditController.js";
import { authenticateJWT, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/logs", authenticateJWT, requireRole(["SUPER_ADMIN", "SUPER_ADMIN_IT", "HR", "BANK_MANAGER", "SUPER_ADMIN_MANAGER"]), getAuditLogs);
router.post("/export", authenticateJWT, exportAuditLogs);
router.get("/metrics", authenticateJWT, requireRole(["SUPER_ADMIN", "SUPER_ADMIN_IT"]), getSecurityMetrics);

export default router;
