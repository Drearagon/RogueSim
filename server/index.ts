import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { fileURLToPath } from 'url';
// import { registerRoutes } from "./routes"; // <--- COMMENTED OUT FOR DEBUGGING 405!
import { serveStatic, log } from "./vite";
// import { initDatabase } from "./db"; // <--- COMMENTED OUT FOR DEBUGGING
// import { initEmailService } from "./emailService"; // <--- COMMENTED OUT FOR DEBUGGING
import path from "path";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// **** COMMENT OUT CUSTOM MIDDLEWARE FOR TESTING ****
// app.use((req, res, next) => {
//   log(`🔍 INCOMING: ${req.method} ${req.path} - User-Agent: ${req.get('User-Agent')?.substring(0, 30) || 'N/A'}`);
//   next();
// });

(async () => {
  try {
    log('🚀 DEBUG: Starting server WITHOUT API routes...');
    
    // **** COMMENT OUT SERVICE INITIALIZATION FOR DEBUGGING ****
    // try {
    //   await initDatabase();
    //   log('✅ Database initialization succeeded');
    // } catch (error) {
    //   log(`⚠️ Database initialization failed: ${error}`, 'warn');
    // }
    
    // try {
    //   await initEmailService();
    //   log('✅ Email service initialization succeeded');
    // } catch (error) {
    //   log(`⚠️ Email service initialization failed: ${error}`, 'warn');
    // }
    
    // **** COMMENT OUT registerRoutes FOR DEBUGGING ****
    // log('🔗 Registering API routes (POTENTIAL 405 SOURCE)...');
    // const server = await registerRoutes(app);
    // log('✅ API routes registered successfully');
    
    // Use direct server creation instead
    const server = createServer(app);

    // Serve static files EARLY (this is what we're testing)
    log('📁 Setting up static file serving WITHOUT API routes...');
    serveStatic(app);
    log('✅ Static file serving configured');

    // **MOVE ERROR HANDLER HERE FOR DEBUGGING**
    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      log(`🚨 ERROR HANDLER HIT: ${req.method} ${req.path} - Status: ${err.status || 500} - ${err.message}`, "error");
      res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
    });

    const port = parseInt(process.env.PORT || "5000", 10);
    const host = process.env.HOST || "0.0.0.0";
    
    server.listen(port, host, () => {
      log(`🚀 DEBUG: Server WITHOUT API routes running on http://${host}:${port}`);
      log(`🎯 Testing if 405 error disappears without registerRoutes...`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
})();
