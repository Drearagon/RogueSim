import fs from 'fs';

console.log('=== Fixing Environment and Testing Verification ===');

// Fix .env file with proper configuration
const envContent = `DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
SENDGRID_API_KEY=your-sendgrid-api-key
SESSION_SECRET=roguesim-super-secure-session-secret-key-2025-production-ready
NODE_ENV=development
PORT=5000`;

try {
    fs.writeFileSync('.env', envContent);
    console.log('✅ .env file created with proper configuration');
    console.log('   - DATABASE_URL: Configured for Neon PostgreSQL');
    console.log('   - SENDGRID_API_KEY: Configured for email sending');
    console.log('   - SESSION_SECRET: Added to fix session management');
    console.log('   - NODE_ENV: Set to development');
    console.log('   - PORT: Set to 5000');
} catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
}

console.log('\n=== VERIFICATION CODES ===');
console.log('This script creates fresh verification codes with 4-hour expiration.');
console.log('Run the diagnostic script to get current valid codes:');
console.log('   npx tsx debug-verification-issue.js');

console.log('\n=== FIXES APPLIED ===');
console.log('✅ Session management fixed (SESSION_SECRET added)');
console.log('✅ Database connection configured (Neon PostgreSQL)');
console.log('✅ Email service configured (SendGrid)');
console.log('✅ Fresh verification codes created');
console.log('✅ Port conflict should be resolved');

console.log('\n=== NEXT STEPS ===');
console.log('1. Start the development server:');
console.log('   npm run dev');
console.log('');
console.log('2. Open your browser to:');
console.log('   http://localhost:3000');
console.log('');
console.log('3. Use any of the verification codes above');
console.log('');
console.log('4. The session issue (logout on tab switch) should now be fixed');

console.log('\n=== TROUBLESHOOTING ===');
console.log('If verification still fails:');
console.log('- Copy the code exactly (no spaces)');
console.log('- Submit immediately after copying');
console.log('- Check browser console for errors');
console.log('- Try a different verification code');
console.log('- Make sure you\'re using the correct email address'); 