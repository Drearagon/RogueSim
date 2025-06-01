import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initDatabase } from "./db";
import { initEmailService } from "./emailService";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple request logger
app.use((req, res, next) => {
  if (req.path.startsWith("/api") || req.path === "/") {
    log(`${req.method} ${req.path}`);
  }
  next();
});

(async () => {
  try {
    log('🚀 Starting RogueSim server initialization...');
    
    // Step 1: Initialize all services FIRST
    log('📊 Initializing core services...');
    
    try {
      await initDatabase();
    } catch (error) {
      log(`⚠️ Database initialization failed: ${error}`, 'warn');
      log('🔄 Server will continue with limited functionality');
    }
    
    try {
      await initEmailService();
    } catch (error) {
      log(`⚠️ Email service initialization failed: ${error}`, 'warn');
      log('🔄 Server will continue without email functionality');
    }
    
    log('✅ Service initialization complete');

    // Step 2: Register API routes (now that services are ready)
    log('🔗 Registering API routes...');
    const server = await registerRoutes(app);
    log('✅ API routes registered successfully');

    // Step 3: Setup Vite dev server OR serve static files for production
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Step 4: Final error handler (should be last)
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
    console.log('💡 Check your environment variables and database connection');
    process.exit(1);
  }
})();
