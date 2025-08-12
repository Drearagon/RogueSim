// server/index.ts (PRODUCTION - FULL FRONTEND + API SERVING)
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve project root and load environment variables from .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { env } from './config';
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./utils";
import { initDatabase } from "./db";
import cors from "cors";

const app = express();

// 1. Basic Express Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 2. CORS Middleware (BEFORE API routes)
app.use(cors({
    origin: env.CLIENT_URL || '*',
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
    if (env.NODE_ENV === 'development') {
      // Only import Vite in development mode
      const viteModule = await import('./vite.js');
      await viteModule.setupVite(app, server);
            log('📁 Vite development server configured');
    } else {
      serveStatic(app);
            log('📁 Static file serving configured');
    }

        // 6. FINAL Error Handler (MUST BE LAST)
    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      log('🚨 ERROR: ${req.method} ${req.path} - Status: ${err.status || 500} - ${err.message}', "error");
      res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
    });

        // 7. Start Server
    const port = parseInt(env.PORT || "5000", 10);
    const host = env.HOST || "0.0.0.0";
    server.listen(port, host, () => {
            log('🚀 Production server running on http://${host}:${port}');
            log('🎯 Frontend and API routes active!');
    });

  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
})();
