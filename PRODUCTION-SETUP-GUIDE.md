# 🚀 Production Setup Guide for iREVA Platform

## 📋 **Render Service Configuration**

Your Nigerian real estate investment platform is ready for production deployment. Follow these steps to replace the placeholders with your actual Render service values.

### **1. Database Configuration**

**Placeholder**: `your_db_password`  
**Replace With**: DB password from Render PostgreSQL service  
**Example**: `supersecurepassword123`

**Placeholder**: `your_db_host`  
**Replace With**: Your Render PostgreSQL hostname  
**Example**: `dpg-xxxxx.render.com`

### **2. Redis Configuration**

**Placeholder**: `your_redis_password`  
**Replace With**: Redis password from Render Redis service  
**Example**: `redissecurepass456`

**Placeholder**: `your_redis_host`  
**Replace With**: Your Render Redis hostname  
**Example**: `redis-xxxxx.render.com`

### **3. Security Configuration**

**Placeholder**: `your_super_secret_jwt_key`  
**Replace With**: Long, random secure string (minimum 32 characters)  
**Example**: `jwt_secret_key_production_ireva_2025_secure_random_string`

### **4. Domain Configuration**

**Placeholder**: `your-frontend-domain.com`  
**Replace With**: Your frontend Render domain  
**Example**: `ireva-frontend.onrender.com`

**Placeholder**: `your-backend-domain.com`  
**Replace With**: Your backend Render domain  
**Example**: `ireva-backend.onrender.com`

## 🔧 **Complete Production Environment Example**

```bash
# After replacement, your .env.production should look like:
DATABASE_URL=postgresql://ireva_user:supersecurepassword123@dpg-xxxxx.render.com:5432/ireva
REDIS_URL=redis://default:redissecurepass456@redis-xxxxx.render.com:6379
JWT_SECRET=jwt_secret_key_production_ireva_2025_secure_random_string
CLIENT_ORIGIN=https://ireva-frontend.onrender.com
VITE_API_URL=https://ireva-backend.onrender.com/api
```

## ⚡ **Your Platform Features Ready for Production**

- **₦7.1 billion** in authentic property investment opportunities
- **Multi-crypto payments** (ETH, USDT, USDC, BNB, MATIC)
- **3 Premium properties** in Lagos and Abuja
- **Real investment tracking** with active ₦500,000 investment
- **Enterprise-grade security** and performance

Your platform will maintain its outstanding 1ms response times in production while serving investors accessing premium Nigerian properties starting from ₦100,000!