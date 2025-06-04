# 🔐 RogueSim Deployment Secrets Setup

## Overview
This guide explains how to securely manage API keys and secrets for RogueSim deployment without exposing them in the git repository.

## 🚨 Security Benefits
- ✅ API keys never committed to git
- ✅ Different keys per environment (dev/staging/prod)
- ✅ No GitHub push protection violations
- ✅ Server-specific configuration
- ✅ Easy key rotation

## 📋 Setup Instructions

### 1. On Your Server
```bash
# Navigate to your RogueSim directory
cd /path/to/roguesim

# Copy the template
cp server-secrets.conf.template server-secrets.conf

# Edit with your actual keys
nano server-secrets.conf
```

### 2. Fill in Your Actual Values
Edit `server-secrets.conf` with your real API keys:

```bash
# Database Configuration
export DB_PASSWORD="your-actual-database-password"
export SESSION_SECRET="your-actual-session-secret-key"

# Email Service Configuration
export SENDGRID_API_KEY="SG.your-actual-sendgrid-key"
export FROM_EMAIL="uplink@roguesim.com"

# PGAdmin Configuration
export PGADMIN_PASSWORD="your-actual-pgadmin-password"
```

### 3. Secure the File
```bash
# Make it readable only by owner
chmod 600 server-secrets.conf

# Verify permissions
ls -la server-secrets.conf
# Should show: -rw------- 1 user user
```

### 4. Deploy Normally
```bash
# All deployment scripts now automatically load secrets
./deploy-to-hetzner.sh
# or
./server-deploy.sh
# or
./fix-and-deploy.sh
```

## 🔄 How It Works

### Scripts That Use Secrets
- `deploy-to-hetzner.sh` - Main deployment script
- `server-deploy.sh` - Server deployment
- `fix-and-deploy.sh` - Quick fix deployment
- `complete-server-fix.sh` - Complete server fix

### Automatic Loading
Each script automatically:
1. Checks for `server-secrets.conf`
2. Loads all environment variables
3. Uses them in Docker Compose and configurations
4. Fails safely if secrets file is missing

## 🔧 Key Rotation

To update API keys:
```bash
# Edit the secrets file
nano server-secrets.conf

# Redeploy (automatic reload)
./deploy-to-hetzner.sh
```

## 🚨 Important Security Notes

### ✅ DO:
- Keep `server-secrets.conf` only on your server
- Use strong, unique passwords
- Set proper file permissions (600)
- Rotate keys regularly
- Use different keys for different environments

### ❌ DON'T:
- Commit `server-secrets.conf` to git
- Share the file via email/chat
- Use the same keys everywhere
- Store keys in plain text elsewhere

## 🔍 Troubleshooting

### Error: "server-secrets.conf not found"
```bash
# Copy the template
cp server-secrets.conf.template server-secrets.conf
# Edit with your values
nano server-secrets.conf
```

### Error: "Permission denied"
```bash
# Fix permissions
chmod 600 server-secrets.conf
```

### Keys Not Loading
```bash
# Test loading manually
source ./server-secrets.conf
echo $SENDGRID_API_KEY
```

## 📁 File Structure
```
roguesim/
├── server-secrets.conf.template  ← Template (committed to git)
├── server-secrets.conf           ← Your actual keys (NOT in git)
├── .gitignore                    ← Excludes secrets files
├── deploy-to-hetzner.sh          ← Uses secrets automatically
└── DEPLOYMENT_SECRETS_SETUP.md   ← This guide
```

## 🎯 Benefits Achieved
- ✅ Zero API keys in git repository
- ✅ No GitHub push protection violations  
- ✅ Secure server-side configuration
- ✅ Easy deployment and key management
- ✅ Production-ready security practices 