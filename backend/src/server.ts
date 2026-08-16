import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes/index.js";
import { logger } from "./utils/logger.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with support for local dev and proxied paths
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
app.use(cors({
  origin: corsOrigin,
  credentials: true
}));

app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// Register API Routes
app.use("/api", apiRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date() });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`Unhandle Exception: ${err.message}`);
  console.error("FULL ERROR DETAILS:", err);
  res.status(500).json({ success: false, message: "An unexpected system error occurred", error: err.message });
});

app.listen(PORT, () => {
  logger.info(`===================================================`);
  logger.info(`Aegis Biometric Banking Backend initialized on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
  logger.info(`===================================================`);
});

export default app;
// Trigger restart for new .env variables
