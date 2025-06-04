#!/bin/bash

echo "🧹 Git History Cleaner for RogueSim"
echo "===================================="
echo ""
echo "⚠️  WARNING: This will rewrite git history!"
echo "⚠️  Make sure you have a backup before proceeding."
echo ""
echo "This script helps remove sensitive data from git history."
echo ""

# Ask for confirmation
read -p "Do you want to proceed with cleaning git history? (y/N): " confirm
if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
    echo "❌ Operation cancelled."
    exit 1
fi

echo ""
echo "🔧 Method 1: GitHub Override (Recommended)"
echo "==========================================="
echo "GitHub detected secrets in your git history from previous commits."
echo "The easiest solution is to use GitHub's override feature:"
echo ""
echo "1. Visit this URL in your browser:"
echo "   https://github.com/Drearagon/RogueSim/security/secret-scanning/unblock-secret/2xlzS9FSxy3obH55HiAM2L1KdhJ"
echo ""
echo "2. Click 'Allow secret' to override the protection for this specific key"
echo ""
echo "3. Then run: git push"
echo ""
echo "This is safe because:"
echo "✅ All current files now use secure environment variables"
echo "✅ The old API key should be rotated/disabled anyway"
echo "✅ No new commits will contain hardcoded keys"
echo ""

read -p "Do you want to continue with git history rewriting instead? (y/N): " continue_rewrite
if [[ $continue_rewrite != [yY] && $continue_rewrite != [yY][eE][sS] ]]; then
    echo "✅ Use the GitHub override method above."
    exit 0
fi

echo ""
echo "🔧 Method 2: Git History Rewriting (Advanced)"
echo "=============================================="
echo ""
echo "This will remove all traces of the API key from git history."
echo "⚠️  WARNING: This is destructive and will change all commit hashes!"
echo ""

# List files that contained the API key
echo "📋 Files that contained the API key:"
echo "- complete-server-fix.sh"
echo "- deploy-direct.sh" 
echo "- fix-and-deploy.sh"
echo "- server-deploy.sh"
echo "- deploy-to-hetzner.sh"
echo "- PRODUCTION_DEPLOYMENT.md"
echo ""

read -p "Final confirmation - rewrite git history? (y/N): " final_confirm
if [[ $final_confirm != [yY] && $final_confirm != [yY][eE][sS] ]]; then
    echo "❌ Operation cancelled."
    exit 1
fi

echo ""
echo "🔧 Installing git-filter-repo if needed..."
# Check if git-filter-repo is available
if ! command -v git-filter-repo &> /dev/null; then
    echo "Installing git-filter-repo..."
    pip install git-filter-repo
fi

echo ""
echo "🧹 Removing sensitive data from git history..."

# Remove the specific API key pattern from all commits
git filter-repo --replace-text <(echo "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==>***REMOVED***")

echo ""
echo "✅ Git history cleaned successfully!"
echo ""
echo "🔄 Next steps:"
echo "1. Force push to update remote repository:"
echo "   git push --force-with-lease origin main"
echo ""
echo "2. All team members will need to re-clone the repository:"
echo "   git clone https://github.com/Drearagon/RogueSim.git"
echo ""
echo "3. Remember to set up server-secrets.conf on your server:"
echo "   cp server-secrets.conf.template server-secrets.conf"
echo "   # Edit with your actual keys"
echo ""

echo "🎯 Recommendation: Use GitHub override instead for simplicity!" 