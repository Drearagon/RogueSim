#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎮 RogueSim Database Setup');
console.log('==========================\n');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  
  // Read env.example and create .env with Docker PostgreSQL settings
  let envContent = fs.readFileSync(envExamplePath, 'utf8');
  
  // Replace with Docker PostgreSQL settings
  envContent = envContent.replace(
    'DATABASE_URL=postgresql://username:password@localhost:5432/roguesim',
    'DATABASE_URL=postgresql://roguesim_user:roguesim_password@localhost:5432/roguesim'
  );
  
  envContent = envContent.replace(
    'SESSION_SECRET=your-super-secret-session-key-at-least-32-characters-long',
    `SESSION_SECRET=${generateRandomSecret()}`
  );
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created with Docker PostgreSQL configuration');
} else {
  console.log('ℹ️  .env file already exists');
}

console.log('\n🐳 Database Setup Options:');
console.log('1. Docker PostgreSQL (Recommended)');
console.log('2. Local PostgreSQL Installation');
console.log('3. Cloud PostgreSQL (Neon, Supabase, etc.)');

console.log('\n📋 Next Steps:');
console.log('');
console.log('Option 1 - Docker PostgreSQL:');
console.log('  1. Install Docker Desktop if not already installed');
console.log('  2. Run: docker-compose up -d');
console.log('  3. Run: npm run db:push');
console.log('  4. Run: npm run dev');
console.log('');
console.log('Option 2 - Local PostgreSQL:');
console.log('  1. Install PostgreSQL locally');
console.log('  2. Create database: createdb roguesim');
console.log('  3. Update DATABASE_URL in .env file');
console.log('  4. Run: npm run db:push');
console.log('  5. Run: npm run dev');
console.log('');
console.log('Option 3 - Cloud PostgreSQL:');
console.log('  1. Create account with Neon, Supabase, or other provider');
console.log('  2. Create database and get connection string');
console.log('  3. Update DATABASE_URL in .env file');
console.log('  4. Run: npm run db:push');
console.log('  5. Run: npm run dev');

console.log('\n🎯 Database Management:');
console.log('  • View database: http://localhost:8080 (PgAdmin - admin@roguesim.local / admin123)');
console.log('  • Database studio: npm run db:studio');
console.log('  • Push schema: npm run db:push');
console.log('  • Generate migration: npm run db:migrate');

function generateRandomSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
} 