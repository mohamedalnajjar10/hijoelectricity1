require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");

// Import routes
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const contactRoutes = require("./routes/contact");

// Import middleware
const { generalLimiter } = require("./middleware/rateLimiter");
const sanitize = require("./middleware/sanitize");
const { errorResponse } = require("./utils/responseHandler");

// Initialize Express app
const app = express();

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400
};
app.use(cors(corsOptions));

// Compression
app.use(
  compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    }
  })
);

// Parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Sanitize
app.use(sanitize);

// Rate limit
app.use("/api", generalLimiter);

// Static uploads (مهم: على Vercel الملفات المكتوبة وقت التشغيل لا تُحفظ دائمًا)
// لكن عرض ملفات موجودة داخل repo يعمل.
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    maxAge: "1d",
    etag: true
  })
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/contact", contactRoutes);

// Root route (اختياري محليًا)
// على Vercel سنخدم الـ frontend عبر rewrites، لكن هذا لا يضر.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// 404 handler
app.use((req, res) => {
  return errorResponse(res, "Route not found", 404);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.name, "-", err.message);

  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return errorResponse(res, "File size too large. Maximum is 5MB", 400);
    }
    return errorResponse(res, `Upload error: ${err.message}`, 400);
  }

  if (err.array && typeof err.array === "function") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.array()
    });
  }

  if (err.name === "SequelizeValidationError") {
    return errorResponse(res, err.errors[0]?.message || "Validation error", 400);
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    return errorResponse(res, "Duplicate entry", 409);
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return errorResponse(res, "Invalid or expired token", 401);
  }

  return errorResponse(
    res,
    process.env.NODE_ENV === "development" ? err.message : "Internal server error",
    err.status || 500,
    process.env.NODE_ENV === "development" ? err : null
  );
});

module.exports = app;

// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const path = require("path");
// const helmet = require("helmet");
// const compression = require("compression");

// // Import routes
// const authRoutes = require("./routes/auth");
// const projectRoutes = require("./routes/projects");
// const contactRoutes = require("./routes/contact");

// // Import middleware
// const { generalLimiter } = require("./middleware/rateLimiter");
// const sanitize = require("./middleware/sanitize");
// const { errorResponse } = require("./utils/responseHandler");

// // Import database connection
// const { connection } = require("./models");

// // Initialize Express app
// const app = express();

// // Security Middleware

// // Helmet for security headers
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
//         fontSrc: ["'self'", "https://fonts.gstatic.com"],
//         imgSrc: ["'self'", "data:", "blob:"],
//         scriptSrc: ["'self'", "'unsafe-inline'"],
//         connectSrc: ["'self'"],
//       },
//     },
//     crossOriginEmbedderPolicy: false, // Allow images to load
//   }),
// );

// // CORS configuration
// const corsOptions = {
//   origin: process.env.ALLOWED_ORIGINS
//     ? process.env.ALLOWED_ORIGINS.split(",")
//     : "*",
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true,
//   maxAge: 86400, // 24 hours
// };
// app.use(cors(corsOptions));

// // Performance Middleware

// // Compression for responses
// app.use(
//   compression({
//     level: 6,
//     threshold: 1024,
//     filter: (req, res) => {
//       if (req.headers["x-no-compression"]) {
//         return false;
//       }
//       return compression.filter(req, res);
//     },
//   }),
// );

// // Parsing Middleware

// // Parse JSON bodies with size limit
// app.use(express.json({ limit: "10kb" }));

// // Parse URL-encoded bodies
// app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// // Security & Rate Limiting

// // Input sanitization
// app.use(sanitize);

// // General rate limiting
// app.use("/api", generalLimiter);

// // Static Files

// // Serve uploaded files
// app.use(
//   "/uploads",
//   express.static(path.join(__dirname, "uploads"), {
//     maxAge: "1d",
//     etag: true,
//   }),
// );

// // Serve frontend files
// app.use(
//   express.static(path.join(__dirname, "../frontend"), {
//     maxAge: process.env.NODE_ENV === "production" ? "1d" : 0,
//     etag: true,
//     extensions: ["html"],
//   }),
// );

// // API Routes

// app.use("/api/auth", authRoutes);
// app.use("/api/projects", projectRoutes);
// app.use("/api/contact", contactRoutes);

// //  Frontend Routes

// // Serve index.html for root route
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "../frontend/index.html"));
// });

// // Error Handling

// // 404 handler
// app.use((req, res) => {
//   return errorResponse(res, "Route not found", 404);
// });

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error("Error:", err.name, "-", err.message);

//   // Multer file upload errors
//   if (err.name === "MulterError") {
//     if (err.code === "LIMIT_FILE_SIZE") {
//       return errorResponse(res, "File size too large. Maximum is 5MB", 400);
//     }
//     return errorResponse(res, `Upload error: ${err.message}`, 400);
//   }

//   // Validation errors from express-validator
//   if (err.array && typeof err.array === "function") {
//     return res.status(400).json({
//       success: false,
//       message: "Validation failed",
//       errors: err.array(),
//     });
//   }

//   // Sequelize errors
//   if (err.name === "SequelizeValidationError") {
//     return errorResponse(
//       res,
//       err.errors[0]?.message || "Validation error",
//       400,
//     );
//   }

//   if (err.name === "SequelizeUniqueConstraintError") {
//     return errorResponse(res, "Duplicate entry", 409);
//   }

//   // JWT errors
//   if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
//     return errorResponse(res, "Invalid or expired token", 401);
//   }

//   // Default error response
//   return errorResponse(
//     res,
//     process.env.NODE_ENV === "development"
//       ? err.message
//       : "Internal server error",
//     err.status || 500,
//     process.env.NODE_ENV === "development" ? err : null,
//   );
// });

// // Server Startup

// const PORT = process.env.PORT || 3000;

// // Sync database and start server
// connection
//   .sync({ force: false })
//   .then(() => {
//     console.log("Database synchronized");

//     app.listen(PORT, () => {
//       console.log(`Server running on http://localhost:${PORT}`);
//       console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
//     });
//   })
//   .catch((err) => {
//     console.error("Database sync failed:", err.message);
//     process.exit(1);
//   });

// // ========== Process Event Handlers ==========

// // Handle unhandled promise rejections
// process.on("unhandledRejection", (err) => {
//   console.error("Unhandled Rejection:", err.name, "-", err.message);
//   // Close server gracefully
//   process.exit(1);
// });

// // Handle uncaught exceptions
// process.on("uncaughtException", (err) => {
//   console.error("Uncaught Exception:", err.name, "-", err.message);
//   process.exit(1);
// });

// // Graceful shutdown
// process.on("SIGTERM", () => {
//   console.log("SIGTERM received. Shutting down gracefully...");
//   process.exit(0);
// });

// module.exports = app;
