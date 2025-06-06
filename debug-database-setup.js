import 'dotenv/config';
import { initDatabase, getDb, getPool } from './server/db.ts';

async function testDatabaseSetup() {
    console.log('=== Database Setup Diagnostic ===');
    
    try {
        // Initialize database
        console.log('1. Initializing database...');
        await initDatabase();
        console.log('   ✅ Database initialized');
        
        // Get clients
        console.log('2. Getting database clients...');
        const db = getDb();
        const pool = getPool();
        
        console.log('   DB type:', typeof db);
        console.log('   DB defined:', !!db);
        console.log('   DB constructor:', db?.constructor?.name);
        
        console.log('   Pool type:', typeof pool);
        console.log('   Pool defined:', !!pool);
        console.log('   Pool constructor:', pool?.constructor?.name);
        console.log('   Pool.query type:', typeof pool?.query);
        console.log('   Pool is function:', typeof pool === 'function');
        
        // Test a simple query on pool
        console.log('3. Testing pool query...');
        if (typeof pool.query === 'function') {
            console.log('   Using Neon Pool .query() method');
            const result = await pool.query('SELECT NOW() as current_time');
            console.log('   Query result rows:', result.rows?.length || 0);
        } else {
            console.log('   Using postgres.js template literal');
            const result = await pool`SELECT NOW() as current_time`;
            console.log('   Query result length:', result?.length || 0);
        }
        
        // Test DatabaseStorage instantiation
        console.log('4. Testing DatabaseStorage instantiation...');
        const { DatabaseStorage } = await import('./server/storage.ts');
        const storage = new DatabaseStorage(db, pool);
        console.log('   ✅ DatabaseStorage created successfully');
        
        // Test a simple storage operation
        console.log('5. Testing storage getUserByEmail...');
        try {
            const user = await storage.getUserByEmail('test@example.com');
            console.log('   ✅ getUserByEmail executed (result:', user ? 'found' : 'not found', ')');
        } catch (error) {
            console.log('   ❌ getUserByEmail failed:', error.message);
        }
        
    } catch (error) {
        console.error('❌ Database setup failed:', error);
    }
}

testDatabaseSetup(); 