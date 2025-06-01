import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// TEMPORARILY COMMENTED OUT - Testing if this causes 405 issues
// app.use((req, res, next) => {
//   const start = Date.now();
//   const path = req.path;
//   let capturedJsonResponse: Record<string, any> | undefined = undefined;

//   const originalResJson = res.json;
//   res.json = function (bodyJson, ...args) {
//     capturedJsonResponse = bodyJson;
//     return originalResJson.apply(res, [bodyJson, ...args]);
//   };

//   res.on("finish", () => {
//     const duration = Date.now() - start;
//     if (path.startsWith("/api")) {
//       let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
//       if (capturedJsonResponse) {
//         logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
//       }

//       if (logLine.length > 80) {
//         logLine = logLine.slice(0, 79) + "…";
//       }

//       log(logLine);
//     }
//   });

//   next();
// });

// Simple request logger instead
app.use((req, res, next) => {
  if (req.path.startsWith("/api") || req.path === "/") {
    log(`${req.method} ${req.path}`);
  }
  next();
});

(async () => {
  // 1. Register API routes FIRST
  const server = await registerRoutes(app);

  // 2. Setup Vite dev server OR serve static files for production
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app); // <--- This should now come BEFORE the catch-all error handler
  }

  // 3. Fallback/Catch-all error handler (should be last or near last)
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    log(`🚨 Unhandled API Error: ${req.method} ${req.path} - ${status} ${message}`, "error");

    res.status(status).json({ message });
    // IMPORTANT: Removed `throw err;` here to prevent Node.js process crashes in production
    // The error is already logged above for debugging purposes
  });

  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || "0.0.0.0";
  
  server.listen(port, host, () => {
    log(`🚀 RogueSim server running on http://${host}:${port}`);
    log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    if (process.env.NODE_ENV === "development") {
      log(`🎮 Game available at: http://localhost:${port}`);
    }
  });
})();
