import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { fileURLToPath } from 'url';
// import { registerRoutes } from "./routes"; // Comment out for testing
import { serveStatic, log } from "./vite";
import path from "path";
import cors from "cors"; // Ensure this is imported

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Place CORS middleware very early
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));
log('DEBUG: CORS middleware configured.');

// Serve static files (production path - copy from serveStatic logic)
const localClientBuildPath = path.join(__dirname, '..', 'dist', 'public');
app.use(express.static(localClientBuildPath));
log(`DEBUG: Serving static files from: ${localClientBuildPath}`);

// SPA Fallback
app.get('*', (req: Request, res: Response) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/sockjs-node')) {
        return res.status(404).json({ message: 'API/WebSocket Not Found' });
    }
    log(`DEBUG: Attempting to serve index.html for GET path: ${req.path}`);
    res.sendFile(path.join(localClientBuildPath, 'index.html'));
});

// No error handler for this bare-bones test

const port = parseInt(process.env.PORT || "5000", 10);
const host = process.env.HOST || "0.0.0.0";
const server = createServer(app);
server.listen(port, host, () => {
    log(`🚀 DEBUG Server running on http://${host}:${port}`);
});
