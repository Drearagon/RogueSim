import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import { fileURLToPath } from 'url';

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
    // Use local path for local development, Docker path only when actually in Docker
    const isInDocker = fs.existsSync('/app'); // Simple Docker detection
    const indexPath = isInDocker 
        ? '/app/dist/public/index.html' 
        : path.resolve(process.cwd(), 'dist', 'public', 'index.html');

    // Log if the file exists (for debugging)
    if (fs.existsSync(indexPath)) {
        log(`DEBUG: Final check - index.html exists at ${indexPath}`);
    } else {
        log(`DEBUG: Critical! index.html NOT found at ${indexPath}`);
        log(`DEBUG: Current working directory: ${process.cwd()}`);
        log(`DEBUG: Checking if dist/public exists: ${fs.existsSync(path.resolve(process.cwd(), 'dist', 'public'))}`);
        log(`DEBUG: Docker detected: ${isInDocker}`);
    }

    // This should serve index.html for ALL GET requests not handled before it
    app.get('*', (req, res) => {
        // If it's an API call, let other routes handle it (or return 404)
        if (req.path.startsWith('/api') || req.path.startsWith('/sockjs-node')) {
            log(`DEBUG: Skipping index.html for API/WebSocket path: ${req.path}`);
            return res.status(404).json({ message: 'API Not Found or not implemented yet' });
        }

        // Log every time this fallback is hit
        log(`DEBUG: Attempting to serve index.html for path: ${req.path}`, 'debug');

        res.sendFile(indexPath, (err) => {
            if (err) {
                log(`DEBUG: Error serving index.html for ${req.path}: ${err.message}`, 'error');
                res.status(500).send('<h1>Server Error: Could not load frontend.</h1>');
            } else {
                log(`DEBUG: Successfully served index.html for ${req.path}`, 'debug');
            }
        });
    });

    // Also, serve static files explicitly (usually before the catch-all)
    // This needs the full path on the host.
    // If you have `express.static` serving, make sure it's doing its job for the correct path.
    // For now, let's rely just on the app.get('*') for index.html.
    // app.use(express.static('/app/dist/public')); // If you want to put this back, ensure order.
}
