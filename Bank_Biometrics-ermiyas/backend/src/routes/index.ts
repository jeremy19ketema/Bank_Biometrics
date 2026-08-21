import { Router } from "express";
import authRoutes from "./authRoutes.js";
import branchRoutes from "./branchRoutes.js";
import staffRoutes from "./staffRoutes.js";
import customerRoutes from "./customerRoutes.js";
import biometricRoutes from "./biometricRoutes.js";
import transactionRoutes from "./transactionRoutes.js";
import auditRoutes from "./auditRoutes.js";
import approvalRoutes from "./approvalRoutes.js";
import attendanceRoutes from "./attendanceRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/branches", branchRoutes);
router.use("/staff", staffRoutes);
router.use("/customers", customerRoutes);
router.use("/biometrics", biometricRoutes);
router.use("/transactions", transactionRoutes);
router.use("/audit", auditRoutes);
router.use("/approvals", approvalRoutes);
router.use("/attendance", attendanceRoutes);

export default router;
