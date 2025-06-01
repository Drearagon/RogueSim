// Temporary debugging script to isolate the 405 issue
// Run this with: node debug-routes.js

import express from 'express';
import { createServer } from 'http';
import { serveStatic } from './server/vite.js';

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add a basic logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Test 1: Without registerRoutes - just serveStatic
console.log("🔍 Testing without registerRoutes...");

// Skip registerRoutes completely
const server = createServer(app);

// Add serveStatic
serveStatic(app);

// Add final error handler
app.use((err, req, res, next) => {
  console.log(`❌ Error handler hit: ${req.method} ${req.path} - ${err.status || 500}`);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

const port = 3001;
server.listen(port, () => {
  console.log(`🚀 Debug server running on http://localhost:${port}`);
  console.log("📝 Test this URL to see if you get 405 or your React app");
});

// Auto-test after 2 seconds
setTimeout(async () => {
  try {
    const response = await fetch(`http://localhost:${port}/`);
    console.log(`\n🔍 Test result: ${response.status} ${response.statusText}`);
    const headers = [...response.headers.entries()];
    console.log('📋 Headers:', headers);
    
    if (response.status === 405) {
      console.log("❌ 405 error reproduced WITHOUT registerRoutes!");
      console.log("🔍 Problem is in serveStatic or basic app setup");
    } else {
      console.log("✅ Works without registerRoutes!");
      console.log("🔍 Problem is inside registerRoutes");
    }
  } catch (error) {
    console.log('❌ Fetch error:', error.message);
  }
  
  process.exit(0);
}, 2000); 