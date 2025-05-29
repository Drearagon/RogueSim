# 🔒 Secure Remote Access Guide for RogueSim

## Current Setup
- **Client Dev Server**: Port 3000 (Vite)
- **Backend Server**: Port 5000 (Express + WebSocket)
- **Production**: Single port (5000) with static files

---

## 🚀 Option 1: Ngrok (Quick & Secure)

### Step 1: Start RogueSim
```bash
npm run dev
```

### Step 2: Create Secure Tunnel (New Terminal)
```bash
# For development (client on port 3000)
ngrok http 3000

# For production (server on port 5000)
ngrok http 5000
```

### Step 3: Share Secure URL
Ngrok will provide URLs like:
- `https://abc123.ngrok.io` ✅ **Share this URL**
- Password protection available with ngrok auth

### ⚡ Advanced Ngrok Setup
```bash
# Create ngrok.yml config file
ngrok config add-authtoken YOUR_AUTHTOKEN
```

Create `ngrok.yml`:
```yaml
version: "2"
authtoken: YOUR_TOKEN_HERE
tunnels:
  roguesim:
    addr: 3000
    proto: http
    auth: "username:password"  # Basic auth protection
    inspect: false            # Disable ngrok inspector
```

Run with config:
```bash
ngrok start roguesim
```

---

## 🛡️ Option 2: Cloudflare Tunnel (Production-Ready)

### Install Cloudflare Tunnel
```bash
# Windows
winget install --id Cloudflare.cloudflared

# Or download from: https://github.com/cloudflare/cloudflared/releases
```

### Setup Tunnel
```bash
# Login to Cloudflare
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create roguesim

# Configure tunnel
```

Create `cloudflared.yml`:
```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /path/to/tunnel/credentials.json

ingress:
  - hostname: roguesim.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
```

### Run Tunnel
```bash
cloudflared tunnel --config cloudflared.yml run
```

---

## 🐳 Option 3: Docker + Reverse Proxy

### Create Docker Setup
```dockerfile
# Dockerfile.production
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY public ./public

EXPOSE 5000
CMD ["npm", "start"]
```

### Docker Compose with SSL
```yaml
# docker-compose.yml
version: '3.8'
services:
  roguesim:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - roguesim
    restart: unless-stopped
```

---

## 🔐 Option 4: VPN Access (Most Secure)

### Using Tailscale (Recommended)
```bash
# Install Tailscale on your PC and client devices
# Windows: https://tailscale.com/download/windows

# After installation, your PC gets a private IP
# Share this IP: http://100.x.x.x:3000
```

### Configure for RogueSim
```bash
# Allow access from any IP
npm run dev -- --host 0.0.0.0
```

---

## ⚡ Quick Start Commands

### For Development (Recommended)
```bash
# Terminal 1: Start RogueSim
npm run dev

# Terminal 2: Create secure tunnel
ngrok http 3000 --auth="player:hacker123"
```

### For Production
```bash
# Build and start production server
npm run build
npm start

# Create tunnel for production
ngrok http 5000 --auth="player:hacker123"
```

---

## 🛡️ Security Best Practices

### 1. Authentication
- Always use ngrok auth: `--auth="username:password"`
- Consider implementing app-level authentication
- Use strong, unique passwords

### 2. Environment Variables
```bash
# .env.production
NODE_ENV=production
PORT=5000
ALLOWED_ORIGINS=https://your-domain.com,https://abc123.ngrok.io
```

### 3. Rate Limiting
Add to your Express server:
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api', limiter);
```

### 4. CORS Configuration
```javascript
app.use((req, res, next) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  next();
});
```

---

## 🚨 Quick Emergency Access

If you need **immediate secure access**:

1. **Install ngrok**: `npm install -g ngrok`
2. **Start RogueSim**: `npm run dev`
3. **Create tunnel**: `ngrok http 3000 --auth="roguesim:securepass123"`
4. **Share the HTTPS URL** (not HTTP)

The ngrok URL will look like: `https://abc123.ngrok.io`

---

## 📱 Mobile Access

All these solutions work on mobile devices! The RogueSim terminal interface is mobile-responsive.

**Best for mobile**:
- Ngrok with basic auth
- Cloudflare Tunnel
- VPN (Tailscale)

---

## ⚠️ Important Notes

1. **Never expose raw localhost** without authentication
2. **Always use HTTPS** for remote access
3. **Monitor access logs** for suspicious activity
4. **Consider IP whitelisting** for sensitive deployments
5. **Test thoroughly** before sharing with others

Choose the option that best fits your security needs and technical comfort level! 