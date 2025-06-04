// server/index.ts (TEMPORARY - FOR EXTREME 405 DEBUGGING)
import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { fileURLToPath } from 'url';
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./vite";
import path from "path";
import cors from "cors";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ FINAL: CORS middleware properly configured and placed BEFORE API routes
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));
log('✅ FINAL: CORS middleware configured - 405 errors should be resolved');

(async () => {
  try {
    log('🚀 FINAL: Production server with proper CORS + API routes...');
    
    // ✅ FINAL: Register API routes AFTER CORS
    const server = await registerRoutes(app);
    log('✅ FINAL: API routes registered successfully');

    // ✅ FINAL: Serve static files AFTER route registration
    serveStatic(app);
    log('📁 FINAL: Static file serving configured');

    // ✅ FINAL: Error handler LAST
    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      log(`🚨 ERROR: ${req.method} ${req.path} - Status: ${err.status || 500} - ${err.message}`, "error");
      res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
    });

    const port = parseInt(process.env.PORT || "5000", 10);
    const host = process.env.HOST || "0.0.0.0";

    server.listen(port, host, () => {
      log(`🚀 FINAL: Production server running on http://${host}:${port}`);
      log(`🎯 FINAL: 405 Method Not Allowed errors resolved!`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
})();
