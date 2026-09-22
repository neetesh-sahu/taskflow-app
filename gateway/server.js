const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createProxyMiddleware } = require("http-proxy-middleware");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://localhost:5001";

const TASK_SERVICE_URL =
  process.env.TASK_SERVICE_URL || "http://localhost:5002";

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "http://localhost:5003";

const TEAM_SERVICE_URL =
  process.env.TEAM_SERVICE_URL || "http://localhost:5004";

/* =========================================================
   CORS
========================================================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow curl, Postman and server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log(`❌ CORS blocked: ${origin}`);

      return callback(new Error("CORS origin not allowed"));
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
    ],

    optionsSuccessStatus: 204,
  })
);

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "api-gateway",
    status: "healthy",
  });
});

/* =========================================================
   AUTH SERVICE
========================================================= */

app.use(
  "/api/auth",
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,

    pathRewrite: (path) => {
      return `/api/auth${path}`;
    },

    onError: (error, req, res) => {
      console.error("❌ Auth Service Error:", error.message);

      if (!res.headersSent) {
        res.status(502).json({
          success: false,
          message: "Auth Service is unavailable",
        });
      }
    },
  })
);

/* =========================================================
   TASK SERVICE
========================================================= */

app.use(
  "/api/tasks",
  createProxyMiddleware({
    target: TASK_SERVICE_URL,
    changeOrigin: true,

    pathRewrite: (path) => {
      return `/api/tasks${path}`;
    },

    onError: (error, req, res) => {
      console.error("❌ Task Service Error:", error.message);

      if (!res.headersSent) {
        res.status(502).json({
          success: false,
          message: "Task Service is unavailable",
        });
      }
    },
  })
);

/* =========================================================
   USER SERVICE
========================================================= */

app.use(
  "/api/users",
  createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,

    pathRewrite: (path) => {
      return `/api/users${path}`;
    },

    onError: (error, req, res) => {
      console.error("❌ User Service Error:", error.message);

      if (!res.headersSent) {
        res.status(502).json({
          success: false,
          message: "User Service is unavailable",
        });
      }
    },
  })
);

/* =========================================================
   TEAM SERVICE
========================================================= */

app.use(
  "/api/teams",
  createProxyMiddleware({
    target: TEAM_SERVICE_URL,
    changeOrigin: true,

    pathRewrite: (path) => {
      return `/api/teams${path}`;
    },

    onError: (error, req, res) => {
      console.error("❌ Team Service Error:", error.message);

      if (!res.headersSent) {
        res.status(502).json({
          success: false,
          message: "Team Service is unavailable",
        });
      }
    },
  })
);

/* =========================================================
   INVITATION SERVICE
========================================================= */

app.use(
  "/api/invitations",
  createProxyMiddleware({
    target: TEAM_SERVICE_URL,
    changeOrigin: true,

    pathRewrite: (path) => {
      return `/api/invitations${path}`;
    },

    onError: (error, req, res) => {
      console.error("❌ Invitation Service Error:", error.message);

      if (!res.headersSent) {
        res.status(502).json({
          success: false,
          message: "Invitation Service is unavailable",
        });
      }
    },
  })
);

/* =========================================================
   404
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API Gateway route not found",
    path: req.originalUrl,
  });
});

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use((error, req, res, next) => {
  console.error("❌ Gateway Error:", error.message);

  if (error.message === "CORS origin not allowed") {
    return res.status(403).json({
      success: false,
      message: "CORS origin not allowed",
    });
  }

  if (!res.headersSent) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }

  next(error);
});

/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("==========================================");
  console.log("        TASKFLOW API GATEWAY");
  console.log("==========================================");
  console.log(`Gateway       : http://localhost:${PORT}`);
  console.log(`Auth Service  : ${AUTH_SERVICE_URL}`);
  console.log(`Task Service  : ${TASK_SERVICE_URL}`);
  console.log(`User Service  : ${USER_SERVICE_URL}`);
  console.log(`Team Service  : ${TEAM_SERVICE_URL}`);
  console.log("");
  console.log("Allowed Frontend Origins:");

  allowedOrigins.forEach((origin) => {
    console.log(`  ✓ ${origin}`);
  });

  console.log("==========================================");
  console.log("");
});
