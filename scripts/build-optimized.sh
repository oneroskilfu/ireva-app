#!/bin/bash

# iREVA Platform - Optimized Docker Build Script
# Uses BuildKit caching for ultra-fast builds

set -e

echo "🚀 Building iREVA Platform with optimized caching..."

# Enable Docker BuildKit for cache mount support
export DOCKER_BUILDKIT=1

# Build with cache mounts for maximum speed
echo "📦 Building with BuildKit cache optimization..."
docker build \
  --tag ireva-platform:latest \
  --tag ireva-platform:$(date +%Y%m%d-%H%M%S) \
  --progress=plain \
  --file Dockerfile \
  .

echo "🧪 Testing the optimized build..."
docker run --rm -d --name ireva-test-optimized -p 8080:10000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=test-secret \
  ireva-platform:latest

# Wait for container to start
sleep 10

# Health check
echo "🔍 Running health check..."
if curl -f http://localhost:8080/api/health; then
  echo "✅ Optimized build successful!"
  echo "⚡ Cache optimization active - future builds will be much faster!"
else
  echo "❌ Health check failed!"
  exit 1
fi

# Clean up test container
docker stop ireva-test-optimized

echo ""
echo "🎉 Optimized Docker build complete!"
echo "📈 Build Performance Benefits:"
echo "   • npm cache: Persistent across builds"
echo "   • node_modules cache: Faster dependency resolution"
echo "   • Layer caching: Only rebuild changed layers"
echo ""
echo "🚀 Deploy to Render.com: git push origin main"