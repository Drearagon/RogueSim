// server/index.ts (PRODUCTION - FULL FRONTEND + API SERVING)
import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { fileURLToPath } from 'url';
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./vite";
import { initDatabase } from "./db";
import path from "path";
import cors from "cors";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Basic Express Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 2. CORS Middleware (BEFORE API routes)
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));
log('✅ CORS middleware configured.');

(async () => {
  try {
        log('🚀 Starting production server with full frontend + API serving...');
    
        // 3. Initialize Database
    await initDatabase();
    log('✅ Database initialized successfully');
    
        // 4. Register API Routes
    const server = await registerRoutes(app);
        log('✅ API routes registered successfully');

        // 5. Serve Static Files / SPA Fallback (AFTER API routes)
    if (process.env.NODE_ENV === 'development') {
      const { setupVite } = await import('./vite.js');
      await setupVite(app, server);
            log('📁 Vite development server configured');
    } else {
      serveStatic(app);
            log('📁 Static file serving configured');
    }

        // 6. FINAL Error Handler (MUST BE LAST)
    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      log(`🚨 ERROR: ${req.method} ${req.path} - Status: ${err.status || 500} - ${err.message}`, "error");
      res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
    });

        // 7. Start Server
    const port = parseInt(process.env.PORT || "5000", 10);
    const host = process.env.HOST || "0.0.0.0";
    server.listen(port, host, () => {
            log(`🚀 Production server running on http://${host}:${port}`);
            log(`🎯 Frontend and API routes active!`);
    });

  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
})();
