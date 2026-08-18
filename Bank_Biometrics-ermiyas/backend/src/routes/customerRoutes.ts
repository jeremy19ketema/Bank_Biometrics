import { Router } from "express";
import { searchCustomers, getCustomerById, createCustomer, enrollBiometrics, updateCustomerStatus } from "../controllers/customerController.js";
import { authenticateJWT, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticateJWT, searchCustomers);
router.get("/:id", authenticateJWT, getCustomerById);
router.post("/", authenticateJWT, requireRole(["SUPER_ADMIN", "BANK_MANAGER", "ACCOUNTANT"]), createCustomer);
router.post("/:id/biometrics", authenticateJWT, requireRole(["SUPER_ADMIN", "BANK_MANAGER", "ACCOUNTANT"]), enrollBiometrics);
router.put("/:id/status", authenticateJWT, requireRole(["SUPER_ADMIN", "BANK_MANAGER"]), updateCustomerStatus);

export default router;
