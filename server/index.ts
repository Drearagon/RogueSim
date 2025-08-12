import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const server = createServer(app);

app.get('/health', (_req, res) => res.status(200).send('ok'));

(async () => {
  if (process.env.NODE_ENV !== 'production') {
    // Dev: attach Vite via dynamic import, so prod never depends on it
    try {
      const viteModule = await import('./vite.js');
      await viteModule.setupVite(app, server);
    } catch (error) {
      console.error('Failed to setup Vite in development mode:', error);
      process.exit(1);
    }
  } else {
    // Prod: serve static build from dist/public/ (frontend assets are in public subdirectory)
    const distDir = path.resolve(__dirname, '.');
    const publicDir = path.join(distDir, 'public');
    
    // Serve static assets from public directory
    app.use(express.static(publicDir));
    
    // SPA fallback for client-side routing
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