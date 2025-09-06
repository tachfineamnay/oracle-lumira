#!/bin/bash
echo "🔧 Fixing and deploying CommandeTemple.tsx..."

# Ensure we're in the right directory
cd /c/Users/hp/Desktop/LumiraV1-MVP

# Check current status
echo "📊 Current git status:"
git status --porcelain

# Add the specific file
git add apps/main-app/src/pages/CommandeTemple.tsx

# Commit with clear message
git commit -m "fix: Resolve ESBuild template literal syntax error

- Fixed corrupted template literal in CommandeTemple.tsx line 33
- Changed: return_url: \${\"\$\"}{window.location.origin}/confirmation
- To: return_url: \`\${window.location.origin}/confirmation?order_id=\${orderId}\`
- ESBuild error resolved: Expected \"}\" but found \"{\"
- Ready for successful Coolify deployment"

# Push to remote
echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ Fix deployed to GitHub! Coolify should now build successfully."
