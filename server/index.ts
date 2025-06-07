// server/index.ts (TEMPORARY - FOR API ROUTE DEBUGGING)
import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { fileURLToPath } from 'url';
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./vite";
import { initDatabase, getDb, getPool } from "./db"; // Ensure correct imports
import path from "path";
import cors from "cors";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Basic Express Middleware (Keep only these for now) ---
// Temporarily comment out if you suspect body parsing issues
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 1. CORS Middleware (VERY EARLY)
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));
log('DEBUG: CORS middleware configured.');

(async () => {
    try {
        log('🚀 Starting server to test API routes...');

        // Initialize Database
        await initDatabase();
        log('✅ Database initialized and connected.');

        // 3. Register API Routes
        const server = await registerRoutes(app); // THIS IS THE FOCUS
        log('✅ API routes registration called.');

        // 4. TEMPORARY: Add a DUMMY root route to confirm Express is working
        app.get('/', (req, res) => {
            res.status(200).send('<h1>API Server is Alive! (Frontend Disabled for Test)</h1>');
        });
        log('DEBUG: Dummy root route added.');

        // 5. TEMPORARILY COMMENT OUT STATIC FILE SERVING
        // if (process.env.NODE_ENV === 'development') {
        //   const { setupVite } = await import('./vite.js');
        //   await setupVite(app, server);
        //   log('📁 Vite development server configured');
        // } else {
        //   serveStatic(app);
        //   log('📁 Static file serving configured');
        // }
        log('DEBUG: Static file serving DISABLED for API test.');

        // 6. FINAL Error Handler (MUST BE LAST)
        app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
            log(`🚨 ERROR HANDLER HIT: ${req.method} ${req.path} - Status: ${err.status || 500} - ${err.message}`, "error");
            res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
        });

        // Server Listener
        const port = parseInt(process.env.PORT || "5000", 10);
        const host = process.env.HOST || "0.0.0.0";
        server.listen(port, host, () => {
            log(`🚀 Server running on http://${host}:${port}`);
        });

    } catch (error) {
        console.error('❌ Server startup failed:', error);
        process.exit(1);
    }
})();
