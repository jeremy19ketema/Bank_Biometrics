import { Router } from "express";
import { login, updatePasscode, getMe, changeUsername, completeFirstLogin, resetUserPassword } from "../controllers/authController.js";
import { authenticateJWT, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/login", login);
router.post("/update-passcode", authenticateJWT, updatePasscode);
router.post("/change-username", authenticateJWT, changeUsername);
router.post("/complete-first-login", authenticateJWT, completeFirstLogin);
router.post("/reset-password", authenticateJWT, requireRole(["SUPER_ADMIN", "SUPER_ADMIN_IT", "BANK_MANAGER", "BRANCH_IT"]), resetUserPassword);
router.get("/me", authenticateJWT, getMe);

export default router;
