import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { fileURLToPath } from 'url';
import { registerRoutes } from "./routes"; // ✅ ENABLED
import { serveStatic, log } from "./vite";
import path from "path";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ Optional middleware for request logging
// app.use((req, res, next) => {
//   log(`🔍 INCOMING: ${req.method} ${req.path} - User-Agent: ${req.get('User-Agent')?.substring(0, 30) || 'N/A'}`);
//   next();
// });

(async () => {
  try {
    log('🚀 Starting server WITH API routes...');
    
    // ✅ Re-enabled route registration
    const server = await registerRoutes(app);
    log('✅ API routes registered successfully');

    // ✅ Serve static files AFTER route registration
    serveStatic(app);
    log('📁 Static file serving configured');

    // ✅ Keep your custom error handler
    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      log(`🚨 ERROR HANDLER HIT: ${req.method} ${req.path} - Status: ${err.status || 500} - ${err.message}`, "error");
      res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
    });

    const port = parseInt(process.env.PORT || "5000", 10);
    const host = process.env.HOST || "0.0.0.0";

    server.listen(port, host, () => {
      log(`🚀 Server WITH routes running on http://${host}:${port}`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
})();
