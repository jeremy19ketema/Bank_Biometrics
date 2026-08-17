import { Router } from "express";
import { authenticateJWT, requireRole } from "../middleware/auth.js";
import {
  getIntegrations,
  registerIntegration,
  rotateIntegrationKey,
  testIntegrationConnection,
  deactivateIntegration
} from "../controllers/integrationController.js";

const router = Router();

router.use(authenticateJWT);
router.use(requireRole(["SUPER_ADMIN", "SUPER_ADMIN_IT"]));

router.get("/", getIntegrations);
router.post("/", registerIntegration);
router.post("/:id/rotate", rotateIntegrationKey);
router.post("/:id/test", testIntegrationConnection);
router.delete("/:id", deactivateIntegration); // Soft delete

export default router;
