import { Router } from "express";
import { getDashboardMetrics, requestReportExport, getExportJobs } from "../controllers/reportController.js";
import { authenticateJWT, requireRoles } from "../middleware/auth.js";

const router = Router();

// Dashboard metrics for any authenticated user (the controller limits data based on role/scope)
router.get("/dashboard", authenticateJWT, getDashboardMetrics);

// Export jobs
router.post("/export", authenticateJWT, requestReportExport);
router.get("/export/jobs", authenticateJWT, getExportJobs);

export default router;
