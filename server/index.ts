import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const server = createServer(app);

// Lightweight health endpoint for k8s/docker
app.get('/health', (_req, res) => res.status(200).send('ok'));

(async () => {
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

    app.use(express.static(publicDir));

    // SPA fallback
    app.get('*', (_req, res) => {
      try {
        const indexPath = path.join(publicDir, 'index.html');
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
