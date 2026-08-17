import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { submitConsent, revokeConsent } from "../controllers/enrollmentController.js";

const router = Router();

router.use(authenticate);

router.post("/consent", authorize(["SUPER_ADMIN", "HR", "BANK_MANAGER"]), submitConsent);
router.post("/consent/:id/revoke", revokeConsent); // Auth logic inside controller

export default router;
