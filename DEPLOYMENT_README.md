# RogueSim - Docker Deployment Guide

## Overview

RogueSim is now fully production-ready with Docker containerization, completely independent of Replit infrastructure. The application features dynamic cyberpunk background visualizations and can run as a standalone containerized service.

## Quick Start

1. **Clone and prepare environment:**
   ```bash
   git clone <your-repo>
   cd roguesim
   cp .env.example .env
   ```

2. **Configure environment variables:**
   Edit `.env` with your database credentials and secrets (see Configuration section below)

3. **Deploy with Docker:**
   ```bash
   ./deploy.sh
   ```

4. **Access your application:**
   Open http://localhost:8000 in your browser

## Configuration

### Required Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secure session key (32+ characters)

### Optional Environment Variables

- `SENDGRID_API_KEY`: For email verification
- `STRIPE_SECRET_KEY` / `VITE_STRIPE_PUBLIC_KEY`: For payments
- `FROM_EMAIL`: Sender email address

Generate a secure session secret:
```bash
openssl rand -base64 32
```

## Docker Architecture

### Multi-stage Build Process

1. **Dependencies**: Install Node.js packages
2. **Build**: Compile frontend and backend
3. **Production**: Minimal runtime container with only necessary files

### Production Optimizations

- Vite dependencies excluded from production bundle
- Static file serving with proper SPA routing
- Health checks for container monitoring
- Resource limits and security hardening
- Comprehensive logging with rotation

## Development vs Production

### Development Mode
- Vite HMR for fast development
- Source maps and debugging tools
- Development server with hot reload

### Production Mode
- Optimized static file serving
- Minified and bundled assets
- Health monitoring endpoints
- Container orchestration ready

## File Structure

```
roguesim/
├── client/                    # React frontend
│   ├── src/components/
│   │   ├── Terminal.tsx       # Main terminal interface
│   │   ├── NetworkVisualizer.tsx  # Dynamic backgrounds
│   │   ├── HexGrid.tsx        # Cyberpunk visuals
│   │   └── MatrixRain.tsx     # Matrix-style effects
├── server/                    # Express backend
│   ├── index.ts              # Production-safe server
│   └── vite.ts               # Development-only Vite config
├── Dockerfile                # Multi-stage production build
├── docker-compose.yml        # Container orchestration
├── deploy.sh                 # Automated deployment script
└── .env.example              # Environment template
```

## Features

### Dynamic Background Visualizations
- **Network Traffic Simulation**: Animated nodes and connections
- **Hex Grid Patterns**: Cyberpunk-style geometric backgrounds
- **Matrix Rain Effects**: Classic falling character animations
- **Activity Responsive**: Backgrounds react to terminal commands

### Security & Performance
- Session-based authentication with bcrypt
- Rate limiting and input sanitization
- Docker security hardening
- Health monitoring and automatic restart
- Optimized asset delivery

## Troubleshooting

### Health Check Failed
```bash
docker-compose logs app
```

### Database Connection Issues
1. Verify `DATABASE_URL` format
2. Check network connectivity
3. Ensure PostgreSQL is accessible from container

### Static Files Not Loading
1. Verify build completed successfully: `npm run build`
2. Check container file permissions
3. Review nginx/proxy configuration if using reverse proxy

## Production Deployment

For production environments:

1. **Use a process manager** (PM2, systemd, or Docker Swarm)
2. **Configure reverse proxy** (nginx, Apache, or Cloudflare)
3. **Set up SSL certificates** (Let's Encrypt recommended)
4. **Configure monitoring** (health checks, logging, metrics)
5. **Database backups** (automated PostgreSQL backups)

## Support

For issues or questions:
1. Check container logs: `docker-compose logs`
2. Verify environment configuration
3. Review this documentation
4. Check GitHub issues for known problems

---

**RogueSim** - Experience the ultimate cyberpunk hacking simulation with dynamic visuals and professional-grade deployment architecture.