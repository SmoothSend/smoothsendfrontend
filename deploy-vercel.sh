#!/bin/bash

echo "🚀 Deploying SmoothSend Frontend to Vercel..."

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the smoothsend-frontend directory."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Go to Vercel Dashboard -> Project -> Settings -> Environment Variables"
echo "2. Add the environment variables from vercel-env-template.txt"
echo "3. Update NEXT_PUBLIC_API_URL with your Azure backend URL"
echo "4. Redeploy to apply environment variables"
echo ""
echo "🔗 Don't forget to update CORS_ORIGIN in your Azure backend!"
