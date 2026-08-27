import { Router } from "express";
import authRoutes from "./authRoutes.js";
import branchRoutes from "./branchRoutes.js";
import staffRoutes from "./staffRoutes.js";
import customerRoutes from "./customerRoutes.js";
import biometricRoutes from "./biometricRoutes.js";
import transactionRoutes from "./transactionRoutes.js";
import auditRoutes from "./auditRoutes.js";
import approvalRoutes from "./approvalRoutes.js";

import { authenticateJWT, requireFirstLoginComplete } from "../middleware/auth.js";

const router = Router();

router.use("/auth", authRoutes);

// Apply authentication and first login check globally to all non-auth routes
router.use(authenticateJWT);
router.use(requireFirstLoginComplete);

router.use("/branches", branchRoutes);
router.use("/staff", staffRoutes);
router.use("/customers", customerRoutes);
router.use("/biometrics", biometricRoutes);
router.use("/transactions", transactionRoutes);
router.use("/audit", auditRoutes);
router.use("/approvals", approvalRoutes);

export default router;
