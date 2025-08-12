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
<<<<<<< HEAD

        // 6. FINAL Error Handler (MUST BE LAST)
    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      log('🚨 ERROR: ${req.method} ${req.path} - Status: ${err.status || 500} - ${err.message}', "error");
      res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
    });

        // 7. Start Server
    const port = parseInt(env.PORT || "5000", 10);
    const host = env.HOST || "0.0.0.0";
    server.listen(port, host, () => {
            log('🚀 Production server running on http://${host}:${port}');
            log('🎯 Frontend and API routes active!');
    });

  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
=======
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
>>>>>>> 6e938b614b71bced01a32d217f731c71a91f7b7f
  }

  const port = Number(process.env.PORT || 5000);
  const host = process.env.HOST || '0.0.0.0';
  server.listen(port, host, () => {
    console.log(`RogueSim listening on http://${host}:${port} (${process.env.NODE_ENV})`);
  });
})();