# 🚀 RogueSim Production Deployment Guide for Hetzner

## Prerequisites
- Hetzner VPS with Ubuntu/Debian
- Domain name pointed to your server's IP
- SSH access to your server

## 🐳 Method 1: Docker Deployment (Recommended)

### 1. Server Setup
```bash
# SSH into your Hetzner server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt install docker-compose-plugin -y

# Install Nginx for reverse proxy
apt install nginx certbot python3-certbot-nginx -y

# Create app directory
mkdir -p /opt/roguesim
cd /opt/roguesim
```

### 2. Upload Your Code
```bash
# Option A: Git clone (if public repo)
git clone https://github.com/yourusername/roguesim.git .

# Option B: Upload via SCP
# From your local machine:
scp -r /path/to/roguesim/* root@your-server-ip:/opt/roguesim/
```

### 3. Create Production Environment
```bash
# Create .env file
cat > .env << EOF
NODE_ENV=production
PORT=5000

# Database Configuration
DATABASE_URL=postgresql://roguesim_user:YOUR_SECURE_PASSWORD@postgres:5432/roguesim

# Session Configuration
SESSION_SECRET=your-super-secure-session-secret-minimum-32-characters-long

# Domain Configuration
DOMAIN=yourdomain.com
BASE_URL=https://yourdomain.com

# Security
TRUST_PROXY=true

# Optional: Email Configuration
# SENDGRID_API_KEY=your-sendgrid-api-key
# FROM_EMAIL=noreply@yourdomain.com
EOF
```

### 4. Enhanced Docker Compose for Production
```bash
cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: roguesim-postgres
    environment:
      POSTGRES_DB: roguesim
      POSTGRES_USER: roguesim_user
      POSTGRES_PASSWORD: YOUR_SECURE_PASSWORD
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
    networks:
      - roguesim-network

  roguesim:
    build: .
    container_name: roguesim-app
    ports:
      - "127.0.0.1:5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    depends_on:
      - postgres
    restart: unless-stopped
    networks:
      - roguesim-network
    volumes:
      - ./logs:/app/logs

volumes:
  postgres_data:

networks:
  roguesim-network:
    driver: bridge
EOF
```

### 5. Build and Deploy
```bash
# Build and start containers
docker compose -f docker-compose.prod.yml up -d --build

# Check if containers are running
docker ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

### 6. Configure Nginx Reverse Proxy
```bash
# Create Nginx configuration
cat > /etc/nginx/sites-available/roguesim << EOF
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Proxy to RogueSim
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # WebSocket support
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
}
EOF

# Enable the site
ln -s /etc/nginx/sites-available/roguesim /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t
systemctl reload nginx
```

### 7. Setup SSL with Let's Encrypt
```bash
# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is already configured
```

### 8. Firewall Configuration
```bash
# Configure UFW firewall
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable
```

## 🔧 Method 2: Manual Deployment (Alternative)

### 1. Install Node.js and Dependencies
```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PostgreSQL
apt install postgresql postgresql-contrib -y

# Install PM2 for process management
npm install -g pm2
```

### 2. Setup Database
```bash
# Switch to postgres user
sudo -u postgres psql

-- Create database and user
CREATE DATABASE roguesim;
CREATE USER roguesim_user WITH PASSWORD 'YOUR_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE roguesim TO roguesim_user;
\q
```

### 3. Deploy Application
```bash
# Copy your application files
cd /opt/roguesim

# Install dependencies
npm ci --only=production

# Build the application
npm run build

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'roguesim',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🔒 Security Best Practices

### 1. Server Hardening
```bash
# Change SSH port (optional)
sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config
systemctl restart sshd

# Disable root login (after setting up sudo user)
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# Install fail2ban
apt install fail2ban -y
```

### 2. Database Security
```bash
# Secure PostgreSQL
sudo -u postgres psql

-- Change default postgres password
ALTER USER postgres PASSWORD 'your_secure_postgres_password';

-- Remove public access
REVOKE ALL ON SCHEMA public FROM public;
GRANT ALL ON SCHEMA public TO roguesim_user;
```

### 3. Application Security
- Use strong passwords for database and session secrets
- Enable HTTPS only (redirect HTTP to HTTPS)
- Regular security updates
- Monitor logs for suspicious activity

## 📊 Monitoring and Maintenance

### 1. Setup Log Rotation
```bash
cat > /etc/logrotate.d/roguesim << EOF
/opt/roguesim/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    notifempty
    create 644 root root
}
EOF
```

### 2. Backup Strategy
```bash
# Create backup script
cat > /opt/backup-roguesim.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups/roguesim"
mkdir -p \$BACKUP_DIR

# Database backup
docker exec roguesim-postgres pg_dump -U roguesim_user roguesim > \$BACKUP_DIR/db_\$DATE.sql

# Application data backup
tar -czf \$BACKUP_DIR/app_\$DATE.tar.gz /opt/roguesim --exclude=/opt/roguesim/node_modules

# Keep only last 7 days
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x /opt/backup-roguesim.sh

# Add to crontab (daily backup at 2 AM)
echo "0 2 * * * /opt/backup-roguesim.sh" | crontab -
```

### 3. Monitoring Commands
```bash
# Check application status
docker compose -f docker-compose.prod.yml ps

# View real-time logs
docker compose -f docker-compose.prod.yml logs -f roguesim

# Check system resources
htop
df -h
free -h

# Check SSL certificate expiry
certbot certificates
```

## 🚀 Deployment Commands

### Start/Stop/Restart
```bash
# Start services
docker compose -f docker-compose.prod.yml up -d

# Stop services
docker compose -f docker-compose.prod.yml down

# Restart specific service
docker compose -f docker-compose.prod.yml restart roguesim

# Update application
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

### Troubleshooting
```bash
# Check container logs
docker logs roguesim-app

# Access container shell
docker exec -it roguesim-app /bin/sh

# Check database
docker exec -it roguesim-postgres psql -U roguesim_user -d roguesim

# Test connectivity
curl -I http://localhost:5000
curl -I https://yourdomain.com
```

## 📝 Domain Configuration

### DNS Records
Point your domain to your Hetzner server:
```
A record: @ -> your-server-ip
A record: www -> your-server-ip
```

### Testing
```bash
# Test local connectivity
curl http://localhost:5000

# Test domain
curl https://yourdomain.com

# Check SSL
curl -I https://yourdomain.com
```

Your RogueSim game will be accessible at `https://yourdomain.com` with full SSL encryption and production-grade performance! 