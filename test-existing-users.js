import 'dotenv/config';
import { initDatabase, getDb, getPool } from './server/db.ts';

async function testExistingUsers() {
    console.log('=== Existing Users Test ===');
    
    try {
        await initDatabase();
        const pool = getPool();
        
        console.log('1. Checking users table...');
        
        let users;
        if (typeof pool.query === 'function') {
            // Neon Pool
            const result = await pool.query('SELECT id, email, hacker_name, created_at FROM users ORDER BY created_at DESC LIMIT 10');
            users = result.rows;
        } else {
            // postgres.js
            users = await pool`SELECT id, email, hacker_name, created_at FROM users ORDER BY created_at DESC LIMIT 10`;
        }
        
        console.log(`Found ${users.length} users:`);
        users.forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.hacker_name} (${user.email}) - Created: ${user.created_at}`);
        });
        
        console.log('\n2. Checking unverified_users table...');
        
        let unverifiedUsers;
        if (typeof pool.query === 'function') {
            const result = await pool.query('SELECT id, email, hacker_name, created_at FROM unverified_users ORDER BY created_at DESC LIMIT 10');
            unverifiedUsers = result.rows;
        } else {
            unverifiedUsers = await pool`SELECT id, email, hacker_name, created_at FROM unverified_users ORDER BY created_at DESC LIMIT 10`;
        }
        
        console.log(`Found ${unverifiedUsers.length} unverified users:`);
        unverifiedUsers.forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.hacker_name} (${user.email}) - Created: ${user.created_at}`);
        });
        
        console.log('\n3. Checking verification_codes table...');
        
        let verificationCodes;
        if (typeof pool.query === 'function') {
            const result = await pool.query('SELECT email, code, used, expires_at, created_at FROM verification_codes ORDER BY created_at DESC LIMIT 5');
            verificationCodes = result.rows;
        } else {
            verificationCodes = await pool`SELECT email, code, used, expires_at, created_at FROM verification_codes ORDER BY created_at DESC LIMIT 5`;
        }
        
        console.log(`Found ${verificationCodes.length} verification codes:`);
        verificationCodes.forEach((code, index) => {
            console.log(`  ${index + 1}. ${code.email} - Code: ${code.code} - Used: ${code.used} - Expires: ${code.expires_at}`);
        });
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testExistingUsers(); 