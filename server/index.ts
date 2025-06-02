// server/index.ts (TEMPORARY - FOR EXTREME 405 DEBUGGING)
import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { fileURLToPath } from 'url';
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./vite";
import path from "path";
// import cors from "cors"; // COMMENTED OUT FOR TEST A

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ❌ TEST A: CORS middleware COMMENTED OUT to test if it's the 405 source
// app.use(cors({
//     origin: process.env.CLIENT_URL || '*',
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
// }));
// log('✅ CORS middleware configured - this should fix 405 errors');

(async () => {
  try {
    log('🧪 TEST A: Starting server WITHOUT CORS middleware...');
    
    // ✅ Register API routes (keeping this for Test A)
    const server = await registerRoutes(app);
    log('✅ API routes registered - testing if CORS was causing 405...');

    // ✅ Serve static files AFTER route registration
    serveStatic(app);
    log('📁 Static file serving configured');

    // ✅ Error handler LAST
    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      log(`🚨 ERROR: ${req.method} ${req.path} - Status: ${err.status || 500} - ${err.message}`, "error");
      res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
    });

    const port = parseInt(process.env.PORT || "5000", 10);
    const host = process.env.HOST || "0.0.0.0";

    server.listen(port, host, () => {
      log(`🧪 TEST A: Server WITHOUT CORS running on http://${host}:${port}`);
      log(`🎯 Testing if CORS was the 405 source...`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
})();
