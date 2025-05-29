import { drizzle } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import postgres from 'postgres';
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure for Neon if using serverless
neonConfig.webSocketConstructor = ws;

// Determine if we're using Neon (serverless) or regular PostgreSQL
const isNeon = process.env.DATABASE_URL.includes('neon.tech') || 
               process.env.DATABASE_URL.includes('neon.database.azure.com');

let db: any;
let pool: any;

if (isNeon) {
  // Use Neon serverless configuration
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNeon({ client: pool, schema });
  console.log('🔗 Connected to Neon PostgreSQL (Serverless)');
} else {
  // Use regular PostgreSQL configuration
  const client = postgres(process.env.DATABASE_URL, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  db = drizzle(client, { schema });
  pool = client;
  console.log('🔗 Connected to PostgreSQL');
}

export { db, pool };