import { Router } from "express";
import { authenticateJWT as authenticate, requireRole as authorize } from "../middleware/auth.js";
import { submitCustomerConsent, revokeCustomerConsent } from "../controllers/customerConsentController.js";

const router = Router();

router.use(authenticate);

router.post("/", authorize(["SUPER_ADMIN", "BANK_MANAGER", "ACCOUNTANT"]), submitCustomerConsent);
router.post("/:id/revoke", authorize(["SUPER_ADMIN", "BANK_MANAGER", "ACCOUNTANT"]), revokeCustomerConsent);

export default router;
