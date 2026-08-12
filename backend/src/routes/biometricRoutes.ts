import { Router } from "express";
import { verifyScan, getScanHistory, getScanStats } from "../controllers/biometricController.js";
import { authenticateJWT } from "../middleware/auth.js";

const router = Router();

router.post("/verify", authenticateJWT, verifyScan);
router.get("/history", authenticateJWT, getScanHistory);
router.get("/stats", authenticateJWT, getScanStats);

export default router;
