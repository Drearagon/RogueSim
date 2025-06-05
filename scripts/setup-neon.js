#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎮 RogueSim - Neon Database Setup');
console.log('==================================\n');

console.log('🚀 Setting up a FREE Neon PostgreSQL database for RogueSim');
console.log('');
console.log('📋 Steps to set up Neon (Free - No Credit Card Required):');
console.log('');
console.log('1. 🌐 Go to: https://neon.tech');
console.log('2. 📝 Sign up for free (GitHub, Google, or email)');
console.log('3. 🗄️  Create a new project:');
console.log('   - Project name: "RogueSim"');
console.log('   - Database name: "roguesim"');
console.log('   - Region: Choose closest to you');
console.log('4. 📋 Copy the connection string from the dashboard');
console.log('5. 📁 Update your .env file with the connection string');
console.log('');
console.log('💡 Your connection string will look like:');
console.log('   DATABASE_URL=postgresql://username:password@ep-xxx.neon.tech/roguesim?sslmode=require');
console.log('');
console.log('✨ Neon Free Tier Benefits:');
console.log('   • 0.5 GB storage');
console.log('   • 191.9 compute hours/month');
console.log('   • Database branching (perfect for development)');
console.log('   • Automatic backups');
console.log('   • Connection pooling');
console.log('   • No credit card required');
console.log('');
console.log('🔧 After setting up Neon:');
console.log('   1. Update DATABASE_URL in your .env file');
console.log('   2. Run: npm run db:push');
console.log('   3. Run: npm run dev');
console.log('');
console.log('🎯 Need help? Check the Neon documentation:');
console.log('   https://neon.tech/docs/getting-started');

// Check if .env exists and offer to update it
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  console.log('');
  console.log('📝 Your .env file exists. After getting your Neon connection string,');
  console.log('   update the DATABASE_URL line in your .env file.');
} else {
  console.log('');
  console.log('⚠️  No .env file found. Run "npm run db:setup" first to create one.');
} 