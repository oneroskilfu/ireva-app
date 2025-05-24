# 🚀 Render Deployment Steps for iREVA Platform

## ✅ **Ready to Deploy Your Nigerian Real Estate Investment Platform!**

Your iREVA platform is perfectly configured for professional deployment on Render.com.

## 🎯 **Step-by-Step Deployment**

### **1. Choose Web Service**
- Go to Render.com dashboard
- Click "New +" → "Web Service"
- Connect your GitHub repository

### **2. Configure Environment**
- **Environment**: Docker
- **Region**: Choose closest to your users
- **Plan**: Free (upgradeable)

### **3. Docker Configuration**
- **Docker Command**: Leave empty (auto-detects docker-compose.yml)
- **Dockerfile Path**: `./apps/server/Dockerfile` (for backend)
- **Build Context**: Root directory

### **4. Set Environment Variables**

**Required Variables:**
```
DATABASE_URL=(auto-generated from PostgreSQL service)
REDIS_URL=(auto-generated from Redis service)
JWT_SECRET=(auto-generated secure token)
POSTGRES_USER=ireva_user
POSTGRES_PASSWORD=(auto-generated)
POSTGRES_DB=ireva_production
NODE_ENV=production
PORT=10000
```

**Optional Variables:**
```
CORS_ORIGIN=https://ireva-frontend.onrender.com
LOG_LEVEL=info
```

## 📋 **Blueprint Deployment (Recommended)**

Use the included `render.yaml` for one-click deployment:

1. Push your code to GitHub
2. Go to Render dashboard
3. Click "New +" → "Blueprint"
4. Connect repository and select `render.yaml`
5. Review services and deploy!

## 🌟 **What Gets Deployed**

✅ **Backend Service**: Express API on custom domain  
✅ **Frontend Service**: React app on CDN  
✅ **PostgreSQL Database**: Managed database service  
✅ **Redis Cache**: Managed Redis instance  

## ⚡ **Expected Performance**

Your platform will maintain excellent performance:
- **Frontend**: Sub-second loading globally
- **Backend**: 10-50ms API responses
- **Database**: Optimized query performance
- **Auto-scaling**: Based on traffic

Perfect for your growing real estate investment community accessing premium Nigerian properties with crypto integration!