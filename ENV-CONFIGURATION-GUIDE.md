# 🔧 Environment Configuration Guide for iREVA Platform

## 📁 Environment File Structure

Your dockerized iREVA platform uses a clean environment separation strategy:

```
/iREVA/
├── .env                 # Current development (used by Replit)
├── .env.production      # Production deployment (Render.com)
├── .env.local          # Local development template
├── .env.backend        # Backend-specific variables
├── .env.frontend       # Frontend-specific variables
└── docker-compose.yml  # Uses .env.local for local Docker
```

## 🎯 Environment Usage by Context

### **Development (Replit)**
- Uses: `.env` (your current setup)
- Perfect for your current workflow

### **Production (Render.com)**
- Uses: `.env.production`
- Automatically applied during Docker build
- Environment variables set in Render dashboard override file values

### **Local Docker Development**
- Uses: `.env.local`
- Copy `.env.local` to `.env` for local Docker development
- Run: `docker-compose up -d`

### **Docker Build Process**
- **Frontend Stage**: Uses `.env.frontend` + `.env.production`
- **Backend Stage**: Uses `.env.backend` + `.env.production`
- **Runtime**: Uses `.env.production`

## ⚙️ TypeScript Path Aliases (Shared Logic)

Your platform now includes organized shared utilities:

```typescript
// Use these imports in both frontend and backend:
import { formatCurrency, calculateROI } from '@shared/utils';
import { INVESTMENT, USER_ROLES } from '@shared/config';
import type { User, Property, Investment } from '@shared/types';
```

### **Shared Structure:**
```
/shared/
├── types/index.ts      # Type-safe API responses, forms, filters
├── utils/index.ts      # Currency, date, validation utilities
└── config/index.ts     # Constants, validation patterns
```

## 🚀 Deployment Workflow

### **Render.com (Recommended)**
1. Environment variables automatically set via `render.yaml`
2. Docker build uses appropriate `.env` files per stage
3. Production runtime uses `.env.production` + Render dashboard variables

### **Local Testing**
```bash
# Test with Docker Compose
cp .env.local .env
docker-compose up -d

# Access at http://localhost:5000
```

### **Environment Priority**
1. **Render Dashboard Variables** (highest priority)
2. **Dockerfile ENV statements**
3. **Environment files** (.env.production, etc.)

## 🔐 Security Best Practices

### **Never Commit Secrets**
- `.env.local` contains example values only
- Real secrets go in Render dashboard
- Use environment-specific files for different deployment stages

### **Environment Separation**
- **Development**: Full logging, debug mode, test APIs
- **Production**: Minimal logging, secure APIs, performance optimized

## 🎉 Benefits of This Setup

✅ **Clean Separation**: Each environment has its specific configuration  
✅ **Docker Optimized**: Multi-stage builds use appropriate environment per stage  
✅ **Shared Logic**: TypeScript path aliases for consistent utilities  
✅ **Production Ready**: Secure, scalable configuration for Render.com  
✅ **Developer Friendly**: Easy local development with Docker Compose  

Your iREVA platform is now perfectly configured for professional deployment with clean environment management!