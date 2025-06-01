// Debug script to test if session middleware causes 405
// Run this with: npx tsx debug-routes-session.js

import express from 'express';
import { createServer } from 'http';
import { serveStatic } from './server/vite.js';
import session from 'express-session';
import connectPg from 'connect-pg-simple';

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add a basic logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

console.log("🔍 Testing with session middleware...");

// Test session configuration (similar to routes.ts)
const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week

const pgStore = connectPg(session);
const sessionStore = new pgStore({
  conString: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test',
  createTableIfMissing: false,
  ttl: sessionTtl,
  tableName: "sessions",
});

// Add session middleware (this might be the culprit!)
app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'test-secret-key',
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: sessionTtl,
    sameSite: 'lax',
    path: '/',
  },
}));

const server = createServer(app);

// Add serveStatic
serveStatic(app);

// Add final error handler
app.use((err, req, res, next) => {
  console.log(`❌ Error handler hit: ${req.method} ${req.path} - ${err.status || 500}`);
  console.log(`❌ Error details:`, err.message);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

const port = 3002;
server.listen(port, () => {
  console.log(`🚀 Debug server with session running on http://localhost:${port}`);
  console.log("📝 Testing if session middleware causes 405...");
});

// Auto-test after 3 seconds (give session store time to fail)
setTimeout(async () => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`http://localhost:${port}/`);
    console.log(`\n🔍 Test result: ${response.status} ${response.statusText}`);
    const headers = [...response.headers.entries()];
    console.log('📋 Headers:', headers);
    
    if (response.status === 405) {
      console.log("❌ 405 error reproduced WITH session middleware!");
      console.log("🔍 Problem is in session configuration/database connection");
    } else {
      console.log("✅ Works with session middleware!");
      console.log("🔍 Problem is somewhere else in registerRoutes");
    }
  } catch (error) {
    console.log('❌ Fetch error:', error.message);
  }
  
  process.exit(0);
}, 3000); 