import { Router } from "express";
import { getDashboardMetrics, requestReportExport, getExportJobs, downloadExport } from "../controllers/reportController.js";
import { authenticateJWT, requireRole } from "../middleware/auth.js";
import { exportLimiter } from "../middleware/rateLimits.js";

const router = Router();

// Dashboard metrics for any authenticated user (the controller limits data based on role/scope)
router.get("/dashboard", authenticateJWT, getDashboardMetrics);

// Export jobs
router.post("/export", exportLimiter, authenticateJWT, requestReportExport);
router.get("/export/jobs", authenticateJWT, getExportJobs);
router.get("/export/download/:id", authenticateJWT, downloadExport);

export default router;
