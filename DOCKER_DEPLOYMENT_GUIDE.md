# RogueSim Docker Deployment Guide

This guide provides comprehensive instructions for deploying RogueSim using Docker for production environments.

## Prerequisites

- Docker 20.10+ installed
- Docker Compose 1.29+ installed
- Access to a Neon PostgreSQL database
- Domain name (optional but recommended for production)

## Quick Start

1. **Clone and Setup Environment**
   ```bash
   git clone <your-repo-url>
   cd roguesim
   cp .env.production.template .env
   ```

2. **Configure Environment Variables**
   Edit `.env` file with your actual values:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `SESSION_SECRET`: A secure 32+ character random string
   - `SENDGRID_API_KEY`: For email verification (optional)
   - `STRIPE_SECRET_KEY`: For payment processing (optional)

3. **Deploy**
   ```bash
   ./docker-deploy.sh
   ```

4. **Access Application**
   - Open http://localhost:8000 in your browser
   - Health check: http://localhost:8000/api/health

## Environment Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require` |
| `SESSION_SECRET` | Secure session key (32+ chars) | `your-super-secret-session-key-at-least-32-characters` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SENDGRID_API_KEY` | SendGrid API key for emails | - |
| `STRIPE_SECRET_KEY` | Stripe secret key for payments | - |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe public key for frontend | - |
| `OPENAI_API_KEY` | OpenAI API key for AI features | - |
| `FROM_EMAIL` | Email address for outbound emails | `noreply@yourdomain.com` |
| `PORT` | Internal application port | `5000` |
| `HOST` | Bind address | `0.0.0.0` |

## Production Deployment

### 1. Database Setup (Neon)

1. Create account at https://neon.tech/
2. Create a new database
3. Copy the connection string
4. Add to `.env` as `DATABASE_URL`

### 2. Email Configuration (Optional)

1. Create account at https://sendgrid.com/
2. Generate API key
3. Add to `.env` as `SENDGRID_API_KEY`

### 3. Payment Processing (Optional)

1. Create account at https://stripe.com/
2. Get API keys from dashboard
3. Add to `.env`:
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `VITE_STRIPE_PUBLIC_KEY=pk_live_...`

### 4. AI Features (Optional)

1. Create account at https://platform.openai.com/
2. Generate API key
3. Add to `.env` as `OPENAI_API_KEY`

## Manual Deployment

If you prefer manual deployment without the script:

```bash
# Build and start
docker-compose up --build -d

# Check logs
docker-compose logs -f app

# Check health
curl http://localhost:8000/api/health

# Stop
docker-compose down
```

## Troubleshooting

### Container Won't Start

1. **Check logs:**
   ```bash
   docker-compose logs app
   ```

2. **Common issues:**
   - Missing `DATABASE_URL` or `SESSION_SECRET`
   - Invalid database connection string
   - Port 8000 already in use

### Database Connection Issues

1. **Verify connection string format:**
   ```
   postgresql://username:password@hostname:port/database?sslmode=require
   ```

2. **Test connection:**
   ```bash
   # Inside container
   docker-compose exec app node -e "
   const { Client } = require('pg');
   const client = new Client({connectionString: process.env.DATABASE_URL});
   client.connect().then(() => console.log('Connected!')).catch(console.error);
   "
   ```

### Health Check Failing

1. **Check container status:**
   ```bash
   docker-compose ps
   ```

2. **Test health endpoint manually:**
   ```bash
   curl -v http://localhost:8000/api/health
   ```

### Build Failures

1. **Clear Docker cache:**
   ```bash
   docker system prune -a
   docker-compose build --no-cache
   ```

2. **Check system resources:**
   - Ensure adequate disk space
   - Ensure adequate memory (4GB+ recommended)

## Security Considerations

1. **Environment Variables:**
   - Use strong, unique `SESSION_SECRET`
   - Keep API keys secure and never commit to version control
   - Use production API keys for production deployments

2. **Network Security:**
   - Use HTTPS in production (configure reverse proxy)
   - Implement rate limiting at proxy level
   - Use firewall rules to restrict access

3. **Database Security:**
   - Use strong database passwords
   - Enable SSL/TLS connections
   - Regularly backup database

## Monitoring

### Container Health

```bash
# View container status
docker-compose ps

# View resource usage
docker stats

# View logs
docker-compose logs -f app
```

### Application Health

```bash
# API health check
curl http://localhost:8000/api/health

# Database connectivity
curl http://localhost:8000/api/test
```

## Scaling

For high-traffic deployments:

1. **Use load balancer** (nginx, HAProxy)
2. **Enable horizontal scaling:**
   ```yaml
   # In docker-compose.yml
   services:
     app:
       deploy:
         replicas: 3
   ```
3. **Use external session store** (Redis)
4. **Implement caching** (Redis, Memcached)

## Backup Strategy

1. **Database backups:**
   - Neon provides automatic backups
   - Export additional backups as needed

2. **Application data:**
   - User uploads (if any)
   - Configuration files
   - SSL certificates

## Support

For deployment issues:
1. Check logs first: `docker-compose logs app`
2. Verify environment configuration
3. Test database connectivity
4. Check system resources
5. Review security settings

Common deployment patterns and solutions are documented in the troubleshooting section above.