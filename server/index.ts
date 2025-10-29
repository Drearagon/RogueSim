import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import { randomUUID } from 'node:crypto';
import { registerRoutes } from './routes';
import { initDatabase } from './db';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const server = createServer(app);

const connectedUsers = new Map<string, { hackerName: string; sockets: Set<string> }>();
const MAX_MESSAGE_LENGTH = 500;

const sanitizeDisplayText = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string') return fallback;
  const cleaned = value.replace(/[<>]/g, '').trim();
  return cleaned.length > 0 ? cleaned : fallback;
};

const sanitizeChatMessage = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim();
};

const getOnlineUserList = () =>
  Array.from(connectedUsers.entries()).map(([userId, data]) => ({
    id: userId,
    username: data.hackerName,
  }));

const broadcastOnlineUsers = (io: SocketIOServer) => {
  io.emit('online_users', getOnlineUserList());
};

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

  const io = new SocketIOServer(server, {
    path: '/ws',
    cors: {
      origin: true,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.join('global');

    socket.emit('system_message', {
      id: randomUUID(),
      message: 'Connected to the Shadow Network relay. Authenticate to engage with other operatives.',
      timestamp: new Date().toISOString(),
    });
    socket.emit('online_users', getOnlineUserList());

    socket.on('join_channel', (payload: any) => {
      const channel = typeof payload?.channel === 'string' ? payload.channel : 'global';

      if (channel === 'team') {
        const teamId = typeof payload?.teamId === 'string' ? payload.teamId : undefined;
        if (teamId) {
          if (socket.data.teamId) {
            socket.leave(`team:${socket.data.teamId}`);
          }
          socket.join(`team:${teamId}`);
          socket.data.teamId = teamId;
        }
      } else {
        socket.join('global');
      }
    });

    socket.on('authenticate', (payload: any) => {
      const rawUserId = payload?.userId;
      const userId = typeof rawUserId === 'string' ? rawUserId.trim() : typeof rawUserId === 'number' ? String(rawUserId) : '';
      if (!userId) {
        return;
      }

      const hackerName = sanitizeDisplayText(payload?.hackerName, 'Agent');

      const previousUserId = socket.data.userId;
      if (previousUserId && previousUserId !== userId) {
        const previousEntry = connectedUsers.get(previousUserId);
        if (previousEntry) {
          previousEntry.sockets.delete(socket.id);
          if (previousEntry.sockets.size === 0) {
            connectedUsers.delete(previousUserId);
          }
        }
      }

      socket.data.userId = userId;
      socket.data.hackerName = hackerName;

      let entry = connectedUsers.get(userId);
      const isFirstConnection = !entry || entry.sockets.size === 0;

      if (!entry) {
        entry = { hackerName, sockets: new Set() };
        connectedUsers.set(userId, entry);
      }

      entry.hackerName = hackerName;
      entry.sockets.add(socket.id);

      socket.join(`user:${userId}`);

      socket.emit('authenticated', {
        id: randomUUID(),
        userId,
        username: hackerName,
        timestamp: new Date().toISOString(),
      });

      if (isFirstConnection) {
        socket.to('global').emit('user_joined', {
          id: randomUUID(),
          userId,
          username: hackerName,
          timestamp: new Date().toISOString(),
        });
      }

      broadcastOnlineUsers(io);
    });

    socket.on('send_message', (payload: any) => {
      const userId: string | undefined = socket.data.userId;
      if (!userId) {
        return;
      }

      const messageBody = sanitizeChatMessage(payload?.message);
      if (!messageBody) {
        return;
      }

      const message = messageBody.slice(0, MAX_MESSAGE_LENGTH);
      const requestedChannel = typeof payload?.channel === 'string' ? payload.channel : 'global';
      const channel = requestedChannel === 'team' && socket.data.teamId ? 'team' : 'global';

      const chatMessage = {
        id: randomUUID(),
        userId,
        username: socket.data.hackerName || 'Agent',
        message,
        timestamp: new Date().toISOString(),
        messageType: channel === 'team' ? 'team' : 'chat',
        channel,
      };

      if (channel === 'team' && socket.data.teamId) {
        io.to(`team:${socket.data.teamId}`).emit('chat_message', chatMessage);
      } else {
        io.to('global').emit('chat_message', chatMessage);
      }
    });

    socket.on('disconnect', () => {
      const userId: string | undefined = socket.data.userId;
      if (!userId) {
        return;
      }

      const entry = connectedUsers.get(userId);
      if (!entry) {
        return;
      }

      entry.sockets.delete(socket.id);

      if (entry.sockets.size === 0) {
        connectedUsers.delete(userId);
        socket.to('global').emit('user_left', {
          id: randomUUID(),
          userId,
          username: entry.hackerName,
          timestamp: new Date().toISOString(),
        });
      }

      broadcastOnlineUsers(io);
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    // Dev: dynamically import local Vite setup via eval'd import
    // to prevent bundlers from including it in production.
    try {
      const dynImport = new Function('p', 'return import(p)');
      // Use .ts explicitly for tsx dev while keeping it dynamic to avoid bundling in prod
      const viteModule = await (dynImport as any)('./vite.ts');
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
