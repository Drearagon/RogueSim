import 'dotenv/config';
import { initDatabase, getDb, getPool } from './server/db.ts';

async function testLogin() {
    console.log('=== Login and Verification Test ===');
    
    try {
        await initDatabase();
        const pool = getPool();
        
        // Test 1: Check existing user details
        console.log('1. Checking existing user details...');
        const userResult = await pool.query(
            'SELECT id, email, hacker_name, password, created_at FROM users WHERE email = $1',
            ['donavinrediron@gmail.com']
        );
        
        if (userResult.rows.length > 0) {
            const user = userResult.rows[0];
            console.log(`   Found user: ${user.hacker_name} (${user.email})`);
            console.log(`   User ID: ${user.id}`);
            console.log(`   Created: ${user.created_at}`);
            console.log(`   Has password: ${user.password ? 'Yes' : 'No'}`);
        } else {
            console.log('   No user found with that email');
        }
        
        // Test 2: Check verification code validity
        console.log('\n2. Checking verification code validity...');
        const now = new Date();
        console.log(`   Current time: ${now}`);
        
        const codesResult = await pool.query(`
            SELECT code, used, expires_at, created_at,
                   CASE 
                       WHEN expires_at > NOW() THEN 'valid'
                       ELSE 'expired'
                   END as status
            FROM verification_codes 
            WHERE email = $1 
            ORDER BY created_at DESC
        `, ['donavinrediron@gmail.com']);
        
        console.log(`   Found ${codesResult.rows.length} verification codes:`);
        codesResult.rows.forEach((code, index) => {
            console.log(`     ${index + 1}. Code: ${code.code} - Used: ${code.used} - Status: ${code.status} - Expires: ${code.expires_at}`);
        });
        
        // Test 3: Test password verification (if we had a test password)
        console.log('\n3. Testing password verification...');
        console.log('   To test login, you would need to know the password for donavinrediron@gmail.com');
        console.log('   The password is bcrypt hashed, so we cannot see it directly.');
        
        // Test 4: Check if verification codes are properly timestamped
        console.log('\n4. Database timezone check...');
        const timeResult = await pool.query('SELECT NOW() as db_time, CURRENT_TIMESTAMP as current_ts');
        console.log(`   Database time: ${timeResult.rows[0].db_time}`);
        console.log(`   Current timestamp: ${timeResult.rows[0].current_ts}`);
        
        // Test 5: Find valid unused verification codes
        console.log('\n5. Finding valid unused verification codes...');
        const validCodesResult = await pool.query(`
            SELECT code, expires_at 
            FROM verification_codes 
            WHERE email = $1 AND used = false AND expires_at > NOW()
            ORDER BY created_at DESC
        `, ['donavinrediron@gmail.com']);
        
        if (validCodesResult.rows.length > 0) {
            console.log(`   Found ${validCodesResult.rows.length} valid unused codes:`);
            validCodesResult.rows.forEach((code, index) => {
                console.log(`     ${index + 1}. Code: ${code.code} - Expires: ${code.expires_at}`);
            });
        } else {
            console.log('   ❌ No valid unused verification codes found');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testLogin(); 