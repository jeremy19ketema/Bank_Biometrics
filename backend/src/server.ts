import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import apiRoutes from "./routes/index.js";
import { logger } from "./utils/logger.js";
import { generalLimiter } from "./middleware/rateLimits.js";
import { isDemoBiometricBypassEnabled } from "./services/biometric/demoMode.js";

dotenv.config();

// Validate MASTER_KEY strictly on startup
function validateMasterKey() {
  const masterKeyBase64 = process.env.MASTER_KEY;
  if (!masterKeyBase64) {
    console.error("FATAL: MASTER_KEY is missing from environment. Server cannot start.");
    process.exit(1);
  }
  const key = Buffer.from(masterKeyBase64, "base64");
  if (key.length !== 32) {
    console.error(`FATAL: Invalid MASTER_KEY length. Expected 32 bytes (after Base64 decoding), got ${key.length} bytes.`);
    process.exit(1);
  }
}

validateMasterKey();

if (isDemoBiometricBypassEnabled()) {
  logger.warn("DEMO BIOMETRIC BYPASS ENABLED: hardware biometric verification is disabled. Do not use this configuration in production.");
}

const app = express();
const PORT = process.env.PORT || 5000;

// Apply Helmet (enabling HSTS only in production)
app.use(helmet({
  hsts: process.env.NODE_ENV === "production" ? { maxAge: 31536000, includeSubDomains: true } : false
}));

// Apply general rate limit to all routes
app.use(generalLimiter);

// Enable CORS securely
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS 
  ? process.env.CORS_ALLOWED_ORIGINS.split(",") 
  : (process.env.NODE_ENV === "production" ? ["https://yourproductiondomain.com"] : ["http://localhost:3000"]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
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
import { prisma } from "./config/db.js";

app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "UP", database: "CONNECTED", timestamp: new Date() });
  } catch (error) {
    logger.error("Health check failed: DB Connection Error");
    res.status(503).json({ status: "DOWN", database: "DISCONNECTED", timestamp: new Date() });
  }
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
