import { drizzle } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import postgres from 'postgres';
import ws from "ws";
import * as schema from "@shared/schema";
import { Pool as PGPool } from "pg";
import { log } from "./vite";

// Export variables that will be initialized later
export let db: any;
export let pool: any;

export async function initDatabase(): Promise<void> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }

    log('🔗 Initializing database connection...');

    // Configure for Neon if using serverless
    neonConfig.webSocketConstructor = ws;

    // Determine if we're using Neon (serverless) or regular PostgreSQL
    const isNeon = process.env.DATABASE_URL.includes('neon.tech') || 
                   process.env.DATABASE_URL.includes('neon.database.azure.com');

    if (isNeon) {
      // Use Neon serverless configuration
      pool = new Pool({ connectionString: process.env.DATABASE_URL });
      db = drizzleNeon({ client: pool, schema });
      log('🔗 Connected to Neon PostgreSQL (Serverless)');
    } else {
      // Use regular PostgreSQL configuration
      const client = postgres(process.env.DATABASE_URL, {
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
      });
      db = drizzle(client, { schema });
      pool = client;
      log('🔗 Connected to PostgreSQL');
    }

    // Test the connection with a simple query
    if (pool.query) {
      await pool.query('SELECT NOW()');
    } else if (pool) {
      await pool`SELECT NOW()`;
    }
    
    log('✅ Database connection test successful');
  } catch (error) {
    log(`❌ Database connection failed: ${error}`, 'error');
    throw error;
  }
}