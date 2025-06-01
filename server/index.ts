import 'dotenv/config';
import express from "express";
import { createServer } from "http";
import { fileURLToPath } from 'url';
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./vite";
import { initDatabase } from "./db";
import { initEmailService } from "./emailService";
import path from "path";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enhanced request logger to see what's happening
app.use((req, res, next) => {
  log(`🔍 INCOMING: ${req.method} ${req.path} - User-Agent: ${req.get('User-Agent')?.substring(0, 30) || 'N/A'}`);
  next();
});

(async () => {
  try {
    log('🚀 Step 2: Starting server with registerRoutes...');
    
    // Initialize services (gracefully handle failures)
    try {
      await initDatabase();
      log('✅ Database initialization succeeded');
    } catch (error) {
      log(`⚠️ Database initialization failed: ${error}`, 'warn');
    }
    
    try {
      await initEmailService();
      log('✅ Email service initialization succeeded');
    } catch (error) {
      log(`⚠️ Email service initialization failed: ${error}`, 'warn');
    }
    
    // Register API routes - THIS IS WHERE THE 405 LIKELY COMES FROM
    log('🔗 Registering API routes (POTENTIAL 405 SOURCE)...');
    const server = await registerRoutes(app);
    log('✅ API routes registered successfully');

    // Serve static files AFTER routes (this worked in Step 1)
    log('📁 Setting up static file serving...');
    serveStatic(app);
    log('✅ Static file serving configured');

    // Final error handler
    app.use((err: any, req: any, res: any, _next: any) => {
      log(`🚨 ERROR HANDLER HIT: ${req.method} ${req.path} - Status: ${err.status || 500} - ${err.message}`, "error");
      res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
    });

    const port = parseInt(process.env.PORT || "5000", 10);
    const host = process.env.HOST || "0.0.0.0";
    
    server.listen(port, host, () => {
      log(`🚀 Step 2: Server with API routes running on http://${host}:${port}`);
      log(`🎯 Now testing if 405 error returns...`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
})();
