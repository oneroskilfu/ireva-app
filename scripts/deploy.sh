#!/bin/bash

# iREVA Platform Deployment Script
# Optimized for Render.com with Docker

set -e

echo "🚀 Starting iREVA Platform Deployment..."

# Build Docker image locally for testing
echo "📦 Building Docker image..."
docker build -t ireva-platform:latest .

# Test the image locally
echo "🧪 Testing Docker image..."
docker run --rm -d --name ireva-test -p 8080:10000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=test-secret \
  ireva-platform:latest

# Wait for container to start
sleep 10

# Health check
echo "🔍 Running health check..."
if curl -f http://localhost:8080/api/health; then
  echo "✅ Health check passed!"
else
  echo "❌ Health check failed!"
  exit 1
fi

# Clean up test container
docker stop ireva-test

echo "🎉 Docker image ready for deployment!"
echo ""
echo "📋 Next Steps:"
echo "1. Push your code to GitHub"
echo "2. Connect your repository to Render.com"
echo "3. Render will automatically build and deploy using the render.yaml"
echo ""
echo "🌐 Your iREVA platform will be live at: https://ireva-platform.onrender.com"