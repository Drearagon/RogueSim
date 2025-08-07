# RogueSim Independent Deployment Guide

## Overview
RogueSim is now fully independent and can run on any system with Docker, without requiring Replit or external dependencies.

## Quick Start (Recommended)

### 1. Clone and Run
```bash
# Make sure you have Docker installed
docker --version
docker-compose --version

# Run the standalone deployment script
./run-standalone.sh
```

This will:
- Create a .env file with secure defaults
- Start PostgreSQL database
- Build and run the application
- Set up all required services

Access your application at: http://localhost:8000

## Manual Setup

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for development)

### 1. Environment Configuration
```bash
cp env.example .env
# Edit .env file with your preferred settings
```

### 2. Standalone Docker (with database)
```bash
docker-compose -f docker-compose.standalone.yml up --build
```

### 3. Development Mode
```bash
npm install
npm run dev
```

## Configuration Options

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection (default: local SQLite fallback)
- `SESSION_SECRET`: Secure session key (auto-generated)
- `NODE_ENV`: development/production
- `PORT`: Server port (default: 5000)
- `SENDGRID_API_KEY`: Email service (optional)
- `STRIPE_SECRET_KEY`: Payment processing (optional)

### Optional Services
All external services are optional and the app gracefully handles their absence:

- **Email Verification**: Works without SendGrid
- **Payments**: Works without Stripe 
- **AI Features**: Uses static content instead of OpenAI

## Production Deployment

### Docker Deployment
```bash
# Build production image
docker build -t roguesim .

# Run with your database
docker run -p 8000:5000 \
  -e DATABASE_URL="your-postgresql-url" \
  -e SESSION_SECRET="your-secure-key" \
  roguesim
```

### Cloud Deployment
The application can be deployed to:
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform
- Any Kubernetes cluster

### Database Options
1. **Included PostgreSQL** (docker-compose.standalone.yml)
2. **External PostgreSQL** (AWS RDS, Google Cloud SQL, etc.)
3. **SQLite fallback** (automatic, for development)

## Health Checks

The application includes comprehensive health monitoring:
- `/api/health` - Basic health check
- `/api/health/full` - Database connectivity check
- Docker health checks for container monitoring

## Security Features

### Production Security
- Non-root user in Docker
- Session-based authentication
- Rate limiting on API endpoints
- Input sanitization
- CSRF protection
- Security audit logging

### Development Security
- Secure defaults for all secrets
- No hardcoded credentials
- Environment variable validation
- Optional service degradation

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
docker-compose -f docker-compose.standalone.yml down
./run-standalone.sh
```

**Database connection issues:**
```bash
# Check database health
docker-compose -f docker-compose.standalone.yml logs postgres

# Reset database
docker-compose -f docker-compose.standalone.yml down -v
./run-standalone.sh
```

**Build failures:**
```bash
# Clean build
docker system prune -f
docker-compose -f docker-compose.standalone.yml build --no-cache
```

### Logs and Monitoring
```bash
# View all logs
docker-compose -f docker-compose.standalone.yml logs -f

# View specific service
docker-compose -f docker-compose.standalone.yml logs -f app
docker-compose -f docker-compose.standalone.yml logs -f postgres
```

## Development

### Local Development
```bash
npm install
npm run dev
```

### Testing
```bash
npm run test
npm run check  # Type checking
```

### Database Management
```bash
npm run db:push    # Apply schema changes
npm run db:studio  # Drizzle Studio GUI
```

## Features

### Game Features
- Terminal-based hacking simulation
- Multiplayer collaboration
- Skill progression system
- Mission generation
- Real-time chat
- Achievement system

### Technical Features
- React + TypeScript frontend
- Express.js backend
- PostgreSQL database
- WebSocket real-time features
- Docker containerization
- Health monitoring
- Security hardening

The application is now completely self-contained and production-ready!