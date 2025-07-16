import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";

// Rate limiting configurations
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === "/api/health";
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
  message: {
    error:
      "Too many authentication attempts from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

export const paymentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // limit each IP to 3 payment attempts per 5 minutes
  message: {
    error: "Too many payment attempts from this IP, please try again later.",
    retryAfter: "5 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net",
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdn.jsdelivr.net",
      ],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: [
        "'self'",
        "https://js.stripe.com",
        "https://maps.googleapis.com",
      ],
      connectSrc: [
        "'self'",
        "https://api.stripe.com",
        "https://*.supabase.co",
        "wss://*.supabase.co",
        process.env.NODE_ENV === "development" ? "http://localhost:*" : "",
      ].filter(Boolean),
      frameSrc: ["'self'", "https://js.stripe.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests:
        process.env.NODE_ENV === "production" ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false, // Required for some payment integrations
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// Input sanitization middleware
export const sanitizeInput = (req, res, next) => {
  // Sanitize against NoSQL injection attacks
  mongoSanitize()(req, res, () => {
    // Protect against HTTP Parameter Pollution attacks
    hpp({
      whitelist: ["category", "tags", "sort"], // Allow these parameters to be arrays
    })(req, res, () => {
      // Custom XSS protection (since xss-clean is deprecated)
      if (req.body) {
        req.body = sanitizeObject(req.body);
      }
      if (req.query) {
        req.query = sanitizeObject(req.query);
      }
      if (req.params) {
        req.params = sanitizeObject(req.params);
      }
      next();
    });
  });
};

// Custom XSS sanitization function
function sanitizeObject(obj) {
  if (typeof obj === "string") {
    return obj
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "");
  }

  if (typeof obj === "object" && obj !== null) {
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
}

// CORS configuration
export const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:8080",
      "http://localhost:3000",
      "https://la-economica.netlify.app",
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200, // Support legacy browsers
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Stripe-Signature",
  ],
};

// Request logging middleware for security monitoring
export const securityLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log sensitive operations
  const sensitiveRoutes = ["/auth", "/payments", "/admin"];
  const isSensitive = sensitiveRoutes.some((route) => req.path.includes(route));

  if (isSensitive) {
    console.log(
      `[SECURITY] ${req.method} ${req.path} - IP: ${req.ip} - User-Agent: ${req.get("User-Agent")}`,
    );
  }

  // Override res.json to log responses for sensitive routes
  const originalJson = res.json;
  res.json = function (body) {
    const duration = Date.now() - startTime;

    if (isSensitive) {
      console.log(
        `[SECURITY] Response ${res.statusCode} for ${req.method} ${req.path} - Duration: ${duration}ms`,
      );

      // Log failed attempts
      if (res.statusCode >= 400) {
        console.warn(
          `[SECURITY ALERT] Failed request: ${req.method} ${req.path} - Status: ${res.statusCode} - IP: ${req.ip}`,
        );
      }
    }

    return originalJson.call(this, body);
  };

  next();
};

// IP validation middleware
export const validateIP = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;

  // Block known malicious IPs (you would maintain this list)
  const blockedIPs = process.env.BLOCKED_IPS
    ? process.env.BLOCKED_IPS.split(",")
    : [];

  if (blockedIPs.includes(clientIP)) {
    console.warn(`[SECURITY] Blocked IP attempt: ${clientIP}`);
    return res.status(403).json({ error: "Access denied" });
  }

  next();
};

export default {
  generalLimiter,
  authLimiter,
  paymentLimiter,
  securityHeaders,
  sanitizeInput,
  corsOptions,
  securityLogger,
  validateIP,
};
