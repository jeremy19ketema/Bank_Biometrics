import { Router } from "express";
import authRoutes from "./authRoutes.js";
import branchRoutes from "./branchRoutes.js";
import customerRoutes from "./customerRoutes.js";
import biometricRoutes from "./biometricRoutes.js";
import transactionRoutes from "./transactionRoutes.js";
import auditRoutes from "./auditRoutes.js";
import approvalRoutes from "./approvalRoutes.js";
import orgRoutes from "./orgRoutes.js";
import roleRoutes from "./roleRoutes.js";
import securityRoutes from "./securityRoutes.js";
import integrationRoutes from "./integrationRoutes.js";
import userRoutes from "./userRoutes.js";
import deviceRoutes from "./deviceRoutes.js";
import enrollmentRoutes from "./enrollmentRoutes.js";
import attendanceRoutes from "./attendanceRoutes.js";
import leaveRoutes from "./leaveRoutes.js";
import payrollRoutes from "./payrollRoutes.js";
import customerConsentRoutes from "./customerConsentRoutes.js";
import reportRoutes from "./reportRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/branches", branchRoutes);
router.use("/users", userRoutes);
router.use("/customers", customerRoutes);
router.use("/biometrics", biometricRoutes);
router.use("/transactions", transactionRoutes);
router.use("/audit", auditRoutes);
router.use("/approvals", approvalRoutes);
router.use("/approval-requests", approvalRoutes); // Retain original alias if needed
router.use("/devices", deviceRoutes);
router.use("/enrollment", enrollmentRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/leave", leaveRoutes);
router.use("/payroll", payrollRoutes);
router.use("/customer-consent", customerConsentRoutes);
router.use("/org", orgRoutes);
router.use("/roles", roleRoutes);
router.use("/security", securityRoutes);
router.use("/integrations", integrationRoutes);
router.use("/reports", reportRoutes);

export default router;
