# 🔧 Environment Configuration Guide for iREVA Platform

## ✅ **Production-Ready Environment Setup**

Your Nigerian real estate investment platform now has comprehensive environment configuration for all deployment scenarios.

## 📁 **Environment Files Overview**

### **`.env.template`** - Production Template
Complete configuration for Render.com deployment with all platform features:
- Frontend and backend URLs
- Database and Redis connections
- JWT authentication settings
- Email notifications with SendGrid
- Crypto payment integration
- File upload configurations

### **`.env.compose`** - Local Development
Optimized for Docker Compose local development:
- Local service URLs (localhost)
- Development database settings
- Relaxed rate limiting for testing
- Hot reload configurations

## 🚀 **Quick Setup Commands**

**For Local Development:**
```bash
cp .env.compose .env
docker-compose up -d --build
```

**For Production Deployment:**
```bash
cp .env.template .env
# Update with your actual production values
# Deploy to Render.com
```

## 🔑 **Critical Variables to Update**

### **Database & Cache:**
- `DATABASE_URL` - Your PostgreSQL connection string
- `REDIS_URL` - Your Redis connection string

### **Security:**
- `JWT_SECRET` - Minimum 32 characters, cryptographically secure
- `TWO_FACTOR_AUTH_SECRET` - For enhanced security features

### **External Services:**
- `SENDGRID_API_KEY` - For email notifications
- `CRYPTO_PAYMENT_WEBHOOK_SECRET` - For crypto integration

### **URLs:**
- `VITE_API_URL` - Your backend service URL
- `CLIENT_ORIGIN` - Your frontend service URL

## ⚡ **Production Benefits**

Your environment configuration supports:
- **Multi-tenant architecture** for scalable growth
- **Real-time features** with Socket.IO
- **Email notifications** for investor updates
- **Crypto payment integration** for seamless transactions
- **Enhanced security** with rate limiting and 2FA

Perfect for your real estate investment platform serving investors accessing premium Nigerian properties!