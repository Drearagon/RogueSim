#!/bin/bash

echo "🔧 Applying Vite.ts Fix Directly"
echo "================================"

cd /opt/roguesim/RogueSim

echo "1️⃣  Backing up current server/vite.ts..."
cp server/vite.ts server/vite.ts.backup

echo ""
echo "2️⃣  Applying the fixed vite.ts..."
cat > server/vite.ts << 'EOF'
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
        \`src="/src/main.tsx"\`,
        \`src="/src/main.tsx?v=\${nanoid()}"\`,
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
  // Get current directory in a more robust way
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  // Try multiple possible locations for the built client files
  const possiblePaths = [
    path.resolve(__dirname, "..", "dist", "public"),
    path.resolve(__dirname, "..", "public"),
    path.resolve(__dirname, "public"),
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(process.cwd(), "public"),
    path.resolve(process.cwd(), "dist"),
  ];

  let distPath = null;
  let indexPath = null;

  // Find the first path that exists and contains index.html
  for (const possiblePath of possiblePaths) {
    const indexFile = path.join(possiblePath, "index.html");
    if (fs.existsSync(possiblePath) && fs.existsSync(indexFile)) {
      distPath = possiblePath;
      indexPath = indexFile;
      log(\`✅ Found client build at: \${distPath}\`);
      break;
    }
  }

  if (!distPath || !indexPath) {
    // List what we actually have in the container for debugging
    log("❌ Could not find client build directory. Available paths:");
    possiblePaths.forEach(p => {
      const exists = fs.existsSync(p);
      log(\`  \${p} - \${exists ? 'EXISTS' : 'NOT FOUND'}\`);
      if (exists) {
        try {
          const files = fs.readdirSync(p).slice(0, 5); // Show first 5 files
          log(\`    Contents: \${files.join(', ')}\${files.length >= 5 ? '...' : ''}\`);
        } catch (e) {
          log(\`    Could not read directory: \${(e as Error).message}\`);
        }
      }
    });
    
    // Instead of crashing, serve a simple error page
    app.use("*", (_req, res) => {
      res.status(500).send(\`
        <html>
          <head><title>RogueSim - Build Error</title></head>
          <body style="font-family: monospace; background: #000; color: #0f0; padding: 20px;">
            <h1>🚨 RogueSim Build Error</h1>
            <p>Could not find client build files.</p>
            <p>Searched in:</p>
            <ul>\${possiblePaths.map(p => \`<li>\${p}</li>\`).join('')}</ul>
            <p>Server is running but client files are missing.</p>
            <p>Try rebuilding with: <code>npm run build</code></p>
          </body>
        </html>
      \`);
    });
    return;
  }

  // Serve static files from the found directory
  app.use(express.static(distPath));

  // Fallback to index.html for SPA routing
  app.use("*", (_req, res) => {
    res.sendFile(indexPath);
  });
}
EOF

echo ""
echo "3️⃣  Showing what was changed..."
echo "New serveStatic function uses robust path discovery:"
grep -A 5 "possiblePaths" server/vite.ts

echo ""
echo "4️⃣  Rebuilding container with the fix..."
docker-compose down
docker-compose build --no-cache app

echo ""
echo "5️⃣  Starting containers..."
docker-compose up -d

echo ""
echo "6️⃣  Waiting for startup..."
sleep 15

echo ""
echo "7️⃣  Testing the fix..."
echo "Checking logs for path discovery messages..."
docker logs --tail 30 roguesim-app-1 | grep -E "(Found client build|Could not find|Available paths)" || echo "No path discovery messages yet"

echo ""
echo "8️⃣  Testing response..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
echo "HTTP Status: $response"

if [ "$response" = "200" ]; then
    echo "✅ SUCCESS! RogueSim is now working!"
    echo "🌐 Check your domain: http://roguesim.com"
elif [ "$response" = "500" ]; then
    echo "⚠️  Getting HTTP 500 - checking if it's our diagnostic page..."
    curl -s http://localhost:3000 | grep -o '<h1>.*</h1>' 2>/dev/null || echo "Not our diagnostic page"
else
    echo "❌ Still not working. HTTP status: $response"
fi

echo ""
echo "9️⃣  Latest logs:"
docker logs --tail 15 roguesim-app-1 