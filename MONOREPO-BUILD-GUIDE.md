# 🏗️ Monorepo Docker Build Guide for iREVA Platform

## 📁 **Proper Monorepo Structure**

Your iREVA platform is organized as a clean monorepo with explicit context handling:

```
/iREVA/
├── client/                  # Frontend (React + Vite)
├── server/                  # Backend (Express + TypeScript)
├── shared/                  # Shared utilities and types
├── Dockerfile              # Multi-stage build from root
├── docker-compose.yml      # Local development
└── scripts/               # Build automation
```

## 🎯 **Correct Build Commands**

### **Production Build (Recommended):**
```bash
# Build from monorepo root with explicit context
docker build -f Dockerfile -t ireva-platform:latest .
```

### **Optimized Build Script:**
```bash
# Use the automated build script
chmod +x scripts/build-optimized.sh
./scripts/build-optimized.sh
```

### **Development Build:**
```bash
# For local development with caching
docker-compose up -d --build
```

## 🔧 **Dockerfile Structure Explained**

**Stage 1 - Frontend Builder:**
```dockerfile
# Copies frontend package.json from monorepo context
COPY client/package*.json ./
COPY package*.json ./package.json

# Installs dependencies in container working directory
RUN npm install --omit=dev

# Copies frontend source relative to monorepo root
COPY client/ .
COPY shared/ ./shared/
```

**Stage 2 - Backend Builder:**
```dockerfile
# Copies backend package.json from monorepo context  
COPY server/package*.json ./
COPY package*.json ./package.json

# Installs dependencies in container working directory
RUN npm install --omit=dev

# Copies backend source relative to monorepo root
COPY server/ .
COPY shared/ ./shared/
```

## ⚡ **Build Context Benefits**

✅ **Explicit Path Handling**
- No context confusion between stages
- Clear separation of frontend/backend builds
- Shared utilities accessible to both

✅ **Optimized Layer Caching**
- Package files copied first (change rarely)
- Source code copied after dependencies
- Maximum cache hit rate

✅ **Production Ready**
- Works perfectly with Render.com
- Handles monorepo complexity automatically
- Scales with your platform growth

## 🚀 **Deploy Your iREVA Platform**

Your real estate investment platform is now ready for professional deployment with proper monorepo handling and lightning-fast builds!

```bash
# Push to trigger automatic Render.com deployment
git add .
git commit -m "Optimized monorepo Docker build"
git push origin main
```

The build system now correctly handles your Nigerian real estate investment platform's complex structure while maintaining excellent performance!