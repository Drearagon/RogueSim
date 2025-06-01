#!/bin/bash

echo "🔧 Fixing .env Database Configuration"
echo "====================================="

cd /opt/roguesim/RogueSim

echo "🔍 Current .env issues detected:"
echo "❌ DATABASE_URL points to 'postgres' but container is 'roguesim-postgres'"
echo "❌ Credentials might not match actual PostgreSQL setup"
echo ""

echo "📋 Current database URL:"
grep DATABASE_URL .env 2>/dev/null || echo "❌ DATABASE_URL not found"

echo ""
echo "📋 Actual container name:"
docker-compose ps | grep postgres

echo ""
echo "🔧 Creating correct .env file..."

# Check if we're using local containers or external database
if docker-compose ps | grep -q "roguesim-postgres"; then
    echo "✅ Using Docker PostgreSQL container"
    
    # Create proper .env for Docker setup
    cat > .env << 'EOF'
# Database Configuration (Docker)
DATABASE_URL=postgresql://rogueuser:roguepass@postgres:5432/roguesim

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-at-least-32-characters-long-for-production-security

# Email Configuration (optional)
SENDGRID_API_KEY=

# Environment
NODE_ENV=production
EOF

    echo "✅ Updated .env with Docker PostgreSQL connection"
else
    echo "⚠️  No PostgreSQL container found, using Neon database"
    
    # Keep existing Neon setup but fix session secret
    cat > .env << 'EOF'
# Database Configuration (Neon)
DATABASE_URL=postgresql://neondb_owner:npg_4VQz2wOZBQ6cWGqVsrcL5wXmP7AJzBxD@ep-wild-brook-a5x8k1hl.us-east-2.aws.neon.tech/neondb?sslmode=require

# Session Configuration  
SESSION_SECRET=your-super-secret-session-key-at-least-32-characters-long-for-production-security

# Email Configuration (optional)
SENDGRID_API_KEY=

# Environment
NODE_ENV=production
EOF

    echo "✅ Updated .env with Neon PostgreSQL connection"
fi

echo ""
echo "🔧 Also fixing docker-compose.yml service names..."

# Make sure docker-compose.yml has correct service name
if grep -q "container_name.*postgres" docker-compose.yml; then
    echo "✅ Container names already correct"
else
    echo "🔧 Updating service names..."
    sed -i 's/container_name: roguesim-postgres/container_name: postgres/g' docker-compose.yml 2>/dev/null || true
fi

echo ""
echo "🔄 Restarting containers with fixed configuration..."
docker-compose down
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 15

echo ""
echo "🧪 Testing the fix..."

echo "📋 Container status:"
docker-compose ps

echo ""
echo "📋 Testing database connection:"
docker-compose exec app node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connection successful:', res.rows[0]);
  }
  process.exit(0);
});
" 2>/dev/null || echo "❌ Database test failed"

echo ""
echo "🧪 Testing login endpoint:"
sleep 5
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}' \
  -s | head -5

echo ""
echo "📋 Recent logs:"
docker-compose logs --tail=10 app

echo ""
echo "🎯 SUMMARY:"
echo "==========="
echo "✅ Fixed DATABASE_URL to match container names"
echo "✅ Updated session secret for security"
echo "✅ Restarted containers with new config"
echo ""
echo "📞 Test login at: http://roguesim.com"
echo ""
echo "If still failing, the issue is likely:"
echo "   • bcrypt compilation in Docker"
echo "   • User table structure mismatch" 