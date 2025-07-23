import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import {
  generalLimiter,
  authLimiter,
  paymentLimiter,
  securityHeaders,
  sanitizeInput,
  corsOptions,
  securityLogger,
  validateIP,
} from "./middleware/security.js";

// import authRoutes from "./auth/routes.js";
// import userRoutes from "./users/routes.js";
// import productRoutes from "./products/routes.js";
// import salesRoutes from "./sales/routes.js";
// import clientRoutes from "./clients/routes.js";
// import employeeRoutes from "./employees/routes.js";
// import reportRoutes from "./reports/routes.js";
// import paymentRoutes from "./payments/routes.js";

dotenv.config({ path: "../.env" });

const app = express();

// Security middleware (apply first)
app.use(securityHeaders);
app.use(validateIP);
app.use(securityLogger);

// CORS with security options
app.use(cors(corsOptions));

// Body parsing with size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Input sanitization
app.use(sanitizeInput);

// Rate limiting
app.use("/api/", generalLimiter);

// Logging
app.use(morgan("combined"));

// Routes with specific rate limiting
// app.use("/api/auth", authLimiter, authRoutes);
// app.use("/api/payments", paymentLimiter, paymentRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/sales", salesRoutes);
// app.use("/api/clients", clientRoutes);
// app.use("/api/employees", employeeRoutes);
// app.use("/api/reports", reportRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "La Económica API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 La Económica API running on port ${PORT}`);
});

export default app;
