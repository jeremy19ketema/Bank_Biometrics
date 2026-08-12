import { Router } from "express";
import { createTransaction, getTransactionHistory, approveTransaction } from "../controllers/transactionController.js";
import { authenticateJWT, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticateJWT, createTransaction);
router.get("/history", authenticateJWT, getTransactionHistory);
router.post("/:id/approve", authenticateJWT, requireRole(["SUPER_ADMIN", "BANK_MANAGER"]), approveTransaction);

export default router;
