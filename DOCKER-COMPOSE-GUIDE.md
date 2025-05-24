# 🐳 Docker Compose Guide for iREVA Platform

## 🚀 **Complete Local Development Stack**

Your iREVA real estate investment platform now has a complete Docker Compose setup for local development and production deployment.

## 📁 **Compose Files Structure**

- **`docker-compose.yml`** - Base configuration for all environments
- **`docker-compose.override.yml`** - Development-specific overrides (auto-loaded)
- **`docker-compose.prod.yml`** - Production configuration

## 🎯 **Quick Start Commands**

### **Development (Default)**
```bash
# Start full development stack
docker-compose up -d

# View logs
docker-compose logs -f

# Rebuild and start
docker-compose up -d --build
```

### **Production**
```bash
# Start production stack
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale backend=3
```

## 🔧 **Services Included**

### **Backend API (Port 3000)**
- Express.js server with TypeScript
- Hot reload for development
- Health checks and monitoring
- Auto-restart on failure

### **Frontend (Port 80)**
- React app with Vite
- Nginx for production serving
- SPA routing configured
- Static asset optimization

### **PostgreSQL Database (Port 5432)**
- Persistent data storage
- Health checks included
- Development database exposed
- Production optimizations

### **Redis Cache (Port 6379)**
- Session storage
- Caching layer
- Development access enabled
- Production memory limits

## ⚡ **Development Benefits**

- **Hot Reload**: Code changes trigger automatic rebuilds
- **Service Discovery**: Services communicate by name
- **Persistent Data**: Database survives container restarts
- **Easy Debugging**: Direct access to all services

## 🎯 **Access Your Platform**

Once running, access your iREVA platform at:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000
- **Database**: localhost:5432 (development only)
- **Redis**: localhost:6379 (development only)

## 🔄 **Useful Commands**

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v

# View service status
docker-compose ps

# Execute commands in containers
docker-compose exec backend npm run migration:run
docker-compose exec postgres psql -U ireva_user -d ireva_dev

# Check health status
docker-compose exec backend curl http://localhost:3000/api/health
```

Your Nigerian real estate investment platform is now ready for professional development with this complete Docker stack!