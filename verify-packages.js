// verify-packages.js
const { execSync } = require('node:child_process');

try {
  console.log('\n🔍 Verifying installed packages...\n');
  execSync('npm ls --production --depth=999', { stdio: 'inherit' });
  console.log('\n✅ All production packages are installed and valid.\n');
  process.exit(0);
} catch (err) {
  console.error('\n❌ Package verification failed. Some dependencies may be missing or broken.\n');
  process.exit(1);
}
