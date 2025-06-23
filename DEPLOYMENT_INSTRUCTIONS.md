# 🚀 Verification Tables Deployment Instructions

## Problem Fixed
- ❌ `Error: relation "verification_codes" does not exist`
- ❌ `Error: relation "unverified_users" does not exist`

## ✅ Solution Applied
Added missing database tables to schema:
- `verification_codes` - for email verification codes
- `unverified_users` - for storing user data before email verification

## 📋 Deployment Steps

### 1. Pull Latest Changes on Hetzner Server
```bash
git pull origin main
```

### 2. Push Schema Changes to Neon Database
```bash
npm run db:push
```

### 3. Restart the Application
```bash
# If using Docker
docker-compose down && docker-compose up -d

# If using PM2 or similar
pm2 restart all
```

### 4. Verify Tables Created
You can verify the tables were created by checking your Neon database dashboard or running:
```bash
npx drizzle-kit studio
```

## 🔍 Expected Results
After deployment, you should see:
- ✅ Email verification working without errors
- ✅ Users can register and receive verification emails
- ✅ Verification codes properly isolated per email address

## 🛠️ Tables Created
1. **verification_codes**
   - `id` (serial primary key)
   - `email` (varchar)
   - `hacker_name` (varchar)
   - `code` (varchar 6 chars)
   - `expires_at` (timestamp)
   - `used` (boolean, default false)
   - `created_at` (timestamp)

2. **unverified_users**
   - `id` (varchar primary key)
   - `email` (varchar unique)
   - `hacker_name` (varchar)
   - `password` (varchar)
   - `profile_image_url` (varchar)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

## 🎯 Security Features Included
- ✅ Crypto-secure verification code generation
- ✅ Email-specific code isolation
- ✅ 10-minute code expiration
- ✅ Single-use codes (marked as used after verification)
- ✅ Input validation and email normalization

The verification system is now production-ready! 🎉 

# RogueSim Deployment Instructions

## Fixed Issues in This Update

### ✅ Critical Production Bug Fixed
- **Fixed:** `TypeError: this.rawPool is not a function` in production
- **Root Cause:** Incorrect postgres.js client usage in `DatabaseStorage` methods
- **Solution:** Changed from `(this.rawPool as NodePgPool).query()` to postgres.js tagged template literals

### ✅ Verification Code System Working
- Crypto-secure 6-digit codes with 10-minute expiration
- Email-specific code isolation
- Proper `used = false` flag setting in database

## Deployment Steps for Hetzner

1. **Commit and Push Changes**
   ```bash
   git add .
   git commit -m "Fix: Resolve verification code production errors - rawPool function fix"
   git push origin main
   ```

2. **SSH to Hetzner Server**
   ```bash
   ssh root@YOUR_HETZNER_IP
   cd /opt/roguesim/RogueSim
   ```

3. **Pull Latest Changes**
   ```bash
   git pull origin main
   ```

4. **Rebuild and Restart Docker Container**
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

5. **Verify Deployment**
   ```bash
   docker-compose logs -f
   ```

## Expected Log Output (Success)
- ✅ SendGrid API initialized successfully
- ✅ Connected to Neon PostgreSQL (Serverless)
- ✅ Database initialized successfully
- 🚀 Production server running on http://0.0.0.0:5000

## Testing Verification Codes
1. Visit your domain and try to register/login
2. Email should be sent successfully
3. Enter the 6-digit code from email
4. Should see successful login without `rawPool is not a function` error

## Environment Variables Required
- `DATABASE_URL` (Neon connection string)
- `SENDGRID_API_KEY` (for email sending)
- `SESSION_SECRET` (optional, will use default if not set)

## Database Schema Status
- ✅ All tables created in Neon database
- ✅ `verification_codes` table with proper `used` column
- ✅ `unverified_users` table for temporary user storage

## Security Features Implemented
- 🔒 Crypto-secure random code generation
- ⏰ 10-minute code expiration
- 🚫 Single-use codes (marked as used immediately)
- 📧 Email-specific code isolation
- 🛡️ Input validation and normalization

The verification system is now production-ready! 🎉 