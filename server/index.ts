import 'dotenv/config';
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { log } from "./vite";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Basic Express Middleware (Keep only these for now) ---
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- Static File Serving (from server/vite.ts logic directly) ---
// For local testing, your local build output is likely `root/dist/public`
const localClientBuildPath = path.join(__dirname, '..', 'dist', 'public');
log(`DEBUG: Serving static files from: ${localClientBuildPath}`);

app.use(express.static(localClientBuildPath)); // Serves actual files (e.g., /assets/main.js)

// --- SPA Fallback (Catch-all for GET requests) ---
app.get('*', (req, res) => {
    // Exclude API paths to avoid conflict if you enable API later
    if (req.path.startsWith('/api') || req.path.startsWith('/sockjs-node')) {
        log(`DEBUG: Skipping index.html for API/WebSocket path: ${req.path}`);
        return res.status(404).json({ message: 'API/WebSocket Not Found or not implemented yet' });
    }

    log(`DEBUG: Attempting to serve index.html fallback for GET path: ${req.path}`);
    const indexPath = path.join(localClientBuildPath, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            log(`DEBUG: Error sending index.html for ${req.path}: ${err.message}`, 'error');
            res.status(500).send('<h1>Local Debug: Error sending index.html.</h1>');
        } else {
            log(`DEBUG: Successfully served index.html for ${req.path}`, 'debug');
        }
    });
});
// --- END SPA Fallback ---

// --- Server Listener ---
const port = parseInt(process.env.PORT || "5000", 10);
const host = process.env.HOST || "0.0.0.0";

const server = createServer(app); // Create basic HTTP server with proper ES import
server.listen(port, host, () => {
    log(`🚀 DEBUG Server running on http://${host}:${port}`);
});

// This is the entire content of server/index.ts for this test.
// Comment out everything else! No registerRoutes, no custom logger, no error handler.
