import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import cors from 'cors';
import { registerRoutes } from './routes';
import { initDatabase } from './db';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const server = createServer(app);

// JSON/body parsing and CORS for API endpoints
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: '*', credentials: true }));

// Request access logging (method, path, status, size, duration)
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  const ip = req.ip || (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '-';
  const ua = (req.headers['user-agent'] as string) || '-';
  res.on('finish', () => {
    const durationMs = Number((process.hrtime.bigint() - start) / BigInt(1e6));
    const length = res.get('content-length') || '-';
    // Log to stdout so docker compose captures it
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} ${length}B ${durationMs}ms ip=${ip} ua="${ua}"`);
  });
  next();
});

// Lightweight health endpoint for k8s/docker
app.get('/health', (_req, res) => res.status(200).send('ok'));

(async () => {
  // Register API routes and middlewares (sessions, security, etc.)
  try {
    await initDatabase();
    console.log('Database initialized successfully');
    await registerRoutes(app);
    console.log('API routes registered successfully');
  } catch (e) {
    console.error('Failed to register API routes:', e);
  }

  if (process.env.NODE_ENV !== 'production') {
    // Dev: dynamically import local Vite setup via eval'd import
    // to prevent bundlers from including it in production.
    try {
      const dynImport = new Function('p', 'return import(p)');
      const viteModule = await (dynImport as any)('./vite.js');
      await viteModule.setupVite(app, server);
    } catch (error) {
      console.error('Failed to setup Vite in development mode:', error);
      process.exit(1);
    }
  } else {
    // Prod: serve prebuilt client from dist/public
    const distDir = path.resolve(__dirname, '.');
    const publicDir = path.join(distDir, 'public');

    // Serve dedicated privacy page if present
    app.get('/privacy', (req, res) => {
      const privacyPath = path.join(publicDir, 'privacy.html');
      if (fs.existsSync(privacyPath)) {
        console.log(`Serving privacy.html for path: ${req.originalUrl}`);
        return res.type('html').send(fs.readFileSync(privacyPath, 'utf-8'));
      }
      console.warn('privacy.html not found in public dir; falling back to SPA');
      return res.status(404).send('Not Found');
    });

    app.use(express.static(publicDir));

    // SPA fallback
    app.get('*', (req, res) => {
      try {
        const indexPath = path.join(publicDir, 'index.html');
        console.log(`Serving index.html for path: ${req.originalUrl}`);
        const html = fs.readFileSync(indexPath, 'utf-8');
        res.type('html').send(html);
      } catch (error) {
        console.error('Failed to serve index.html:', error);
        res.status(500).send('Server Error: Could not load frontend.');
      }
    });
  }

  const port = Number(process.env.PORT || 5000);
  const host = process.env.HOST || '0.0.0.0';
  server.listen(port, host, () => {
    console.log(`RogueSim listening on http://${host}:${port} (${process.env.NODE_ENV})`);
  });
})();
