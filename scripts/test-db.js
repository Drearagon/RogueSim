#!/usr/bin/env node

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import postgres from 'postgres';
import ws from "ws";

// Load environment variables
config();

console.log('🎮 RogueSim Database Connection Test');
console.log('====================================\n');

if (!process.env.DATABASE_URL) {
  console.log('❌ DATABASE_URL not found in environment variables');
  console.log('');
  console.log('📝 Please ensure you have a .env file with DATABASE_URL set');
  console.log('   Run: npm run db:setup (for Docker setup)');
  console.log('   Run: npm run db:setup-neon (for Neon setup)');
  process.exit(1);
}

console.log('🔗 Testing database connection...');
console.log(`📍 Database URL: ${process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@')}`);

// Configure for Neon if using serverless
neonConfig.webSocketConstructor = ws;

// Determine if we're using Neon (serverless) or regular PostgreSQL
const isNeon = process.env.DATABASE_URL.includes('neon.tech') || 
               process.env.DATABASE_URL.includes('neon.database.azure.com');

let db;
let client;

try {
  if (isNeon) {
    console.log('🌐 Detected Neon PostgreSQL (Serverless)');
    client = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzleNeon({ client });
  } else {
    console.log('🐘 Detected Regular PostgreSQL');
    client = postgres(process.env.DATABASE_URL, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    db = drizzle(client);
  }

  // Test the connection
  const result = await db.execute('SELECT version() as version, current_database() as database, current_user as user');
  
  console.log('✅ Database connection successful!');
  console.log('');
  console.log('📊 Database Information:');
  console.log(`   Database: ${result.rows[0].database}`);
  console.log(`   User: ${result.rows[0].user}`);
  console.log(`   Version: ${result.rows[0].version.split(' ').slice(0, 2).join(' ')}`);
  console.log('');
  console.log('🎯 Next steps:');
  console.log('   1. Run: npm run db:push (to create tables)');
  console.log('   2. Run: npm run dev (to start the application)');
  
} catch (error) {
  console.log('❌ Database connection failed!');
  console.log('');
  console.log('🔍 Error details:');
  console.log(`   ${error.message}`);
  console.log('');
  console.log('💡 Troubleshooting:');
  
  if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
    console.log('   • Check if your database server is running');
    console.log('   • Verify the DATABASE_URL is correct');
    if (!isNeon) {
      console.log('   • For Docker: Run "docker-compose up -d"');
    }
  } else if (error.message.includes('authentication failed')) {
    console.log('   • Check your username and password in DATABASE_URL');
  } else if (error.message.includes('database') && error.message.includes('does not exist')) {
    console.log('   • The database does not exist, create it first');
  }
  
  console.log('   • Double-check your .env file');
  console.log('   • Ensure no extra spaces in DATABASE_URL');
  
  process.exit(1);
} finally {
  // Close the connection
  if (client) {
    if (isNeon) {
      await client.end();
    } else {
      await client.end();
    }
  }
} 