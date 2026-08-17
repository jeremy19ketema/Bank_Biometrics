import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { getPayrollReport, getPayrollReportCSV } from "../controllers/payrollController.js";

const router = Router();

router.use(authenticate);

// We allow HR, Super Admin, and Bank Managers to pull reports
router.get("/report", authorize(["SUPER_ADMIN", "HR", "BANK_MANAGER"]), getPayrollReport);
router.get("/report/csv", authorize(["SUPER_ADMIN", "HR", "BANK_MANAGER"]), getPayrollReportCSV);

export default router;
