import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple request logger (removed the complex monkey-patching)
app.use((req, res, next) => {
  if (req.path.startsWith("/api") || req.path === "/") {
    log(`${req.method} ${req.path}`);
  }
  next();
});

(async () => {
  try {
    // 1. Register API routes FIRST
    const server = await registerRoutes(app);

    // 2. Setup Vite dev server OR serve static files for production
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // 3. Fallback/Catch-all error handler (should be last)
    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      log(`🚨 Unhandled API Error: ${req.method} ${req.path} - ${status} ${message}`, "error");

      res.status(status).json({ message });
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
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    console.log('🔄 This is likely a database connection issue');
    process.exit(1);
  }
})();
