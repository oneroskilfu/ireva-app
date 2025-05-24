# 🔄 SPA Routing Configuration for iREVA Platform

## ⚠️ **Critical for React Router**

Your iREVA real estate investment platform uses React Router for navigation. Without proper nginx configuration, users will get 404 errors when refreshing pages or accessing direct URLs.

## ✅ **Solution Implemented**

Created `client/nginx.conf` with proper SPA routing:

```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Handle React Router SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets for performance
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

## 🎯 **What This Fixes**

**Without nginx.conf:**
- ❌ `/properties` refresh → 404 error
- ❌ `/dashboard` direct link → 404 error  
- ❌ `/auth` bookmark → 404 error

**With nginx.conf:**
- ✅ All routes work perfectly
- ✅ Page refreshes maintain state
- ✅ Direct links function correctly
- ✅ Bookmarks work as expected

## 🚀 **Deployment Options**

### **Full-Stack (Current Setup)**
Your main Dockerfile includes nginx configuration for the Express server that serves static files with proper routing.

### **Frontend-Only Option**
Use `client/Dockerfile.nginx` for separate frontend deployments:

```bash
# Build frontend-only with nginx
docker build -f client/Dockerfile.nginx -t ireva-frontend .
```

## 🔧 **How It Works**

The `try_files $uri $uri/ /index.html;` directive:
1. Tries to serve the exact file requested
2. Tries to serve it as a directory
3. Falls back to `/index.html` (letting React Router handle routing)

This ensures your iREVA platform's property listings, investor dashboard, and authentication routes all work seamlessly in production!

## 📈 **Performance Benefits**

- **Asset Caching**: Static files cached for 1 year
- **Gzip Compression**: Faster page loads
- **Security Headers**: Enhanced protection
- **Optimized Delivery**: Production-ready configuration

Your Nigerian real estate investment platform now has bulletproof routing that works perfectly for all user navigation patterns!