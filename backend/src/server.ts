import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import apiRoutes from "./routes/index.js";
import webauthnRoutes from "./routes/webauthnRoutes.js";
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

// Security Middleware
app.use(helmet());

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes" }
});
app.use(globalLimiter);

// Request logger middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// Register API Routes
app.use("/api/auth/webauthn", webauthnRoutes);
app.use("/api", apiRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date() });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`Unhandled Exception: ${err.message}`);
  console.error("FULL ERROR DETAILS:", err);
  
  const errorDetails = process.env.NODE_ENV === "production" ? undefined : err.message;
  
  res.status(500).json({ 
    success: false, 
    message: "An unexpected system error occurred", 
    ...(errorDetails && { error: errorDetails })
  });
});

app.listen(PORT, () => {
  logger.info(`===================================================`);
  logger.info(`Aegis Biometric Banking Backend initialized on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
  logger.info(`===================================================`);
});

export default app;
// Trigger restart for new .env variables
