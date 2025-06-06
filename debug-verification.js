// Debug verification code mismatch
import 'dotenv/config';

async function debugVerificationCodes() {
    console.log('=== DEBUGGING VERIFICATION CODE MISMATCH ===');
    
    try {
        // Import the storage and email service
        const { DatabaseStorage } = await import('./server/storage.js');
        const { getDb, getPool } = await import('./server/db.js');
        const { sendVerificationEmail } = await import('./server/emailService.js');
        
        // Initialize storage
        await import('./server/db.js').then(async (db) => {
            await db.initDatabase();
        });
        
        const dbInstance = getDb();
        const poolInstance = getPool();
        const storage = new DatabaseStorage(dbInstance, poolInstance);
        
        const testEmail = 'donavinrediron@gmail.com';
        
        // 1. Generate a code like the server does
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`🔢 Generated code: ${code}`);
        
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        console.log(`⏰ Expires at: ${expiresAt.toISOString()}`);
        
        // 2. Store it in database
        await storage.storeVerificationCode({
            email: testEmail.toLowerCase().trim(),
            hackerName: 'TestAgent',
            code,
            expiresAt
        });
        console.log(`✅ Stored code in database for: ${testEmail}`);
        
        // 3. Try to retrieve it
        const verification = await storage.getVerificationCode(testEmail.toLowerCase().trim(), code);
        console.log(`🔍 Retrieved verification:`, {
            found: !!verification,
            code: verification?.code,
            email: verification?.email,
            used: verification?.used,
            expired: verification ? new Date() > verification.expiresAt : 'N/A'
        });
        
        // 4. Test the email sending
        console.log(`📧 Testing email sending...`);
        const emailSent = await sendVerificationEmail(testEmail, code, 'TestAgent');
        console.log(`📧 Email sent result: ${emailSent}`);
        
        // 5. Test different code (should fail)
        const wrongCode = '999999';
        const wrongVerification = await storage.getVerificationCode(testEmail.toLowerCase().trim(), wrongCode);
        console.log(`❌ Wrong code test:`, {
            found: !!wrongVerification,
            shouldBeFalse: !wrongVerification
        });
        
        console.log('\n=== DEBUG COMPLETE ===');
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
    }
    
    process.exit(0);
}

debugVerificationCodes(); 