# 🧱 Monorepo Structure Guide for iREVA Platform

## 🎯 **Recommended Setup: Separate Dockerfiles (Per Service)**

Your iREVA real estate investment platform now follows the industry-standard monorepo structure with isolated services for better control and deployment flexibility.

## 📁 **New Structure Overview**

```
ireva/
├── apps/
│   ├── client/          # Frontend (React + Vite)
│   │   ├── Dockerfile   # Frontend-specific build
│   │   ├── nginx.conf   # Production serving
│   │   └── src/         # React application
│   └── server/          # Backend (Express + WebSocket)
│       ├── Dockerfile   # Backend-specific build
│       └── src/         # Express application
├── shared/              # Shared types and utilities
├── docker-compose.yml   # Multi-service orchestration
└── docs/               # Documentation
```

## ✅ **Benefits of This Structure**

**🔄 Better Isolation:**
- Each service has its own build process
- Independent deployment strategies
- Clearer dependency management

**⚡ Optimized Performance:**
- Service-specific optimizations
- Smaller, focused container images
- Better caching strategies

**🚀 Deployment Flexibility:**
- Deploy services independently
- Scale services based on demand
- Mix deployment strategies (containerized backend, static frontend)

## 🎯 **Build Commands**

**Frontend Only:**
```bash
docker build -f apps/client/Dockerfile -t ireva-frontend .
```

**Backend Only:**
```bash
docker build -f apps/server/Dockerfile -t ireva-backend .
```

**Full Stack:**
```bash
docker-compose up -d --build
```

## 🌟 **Perfect for Render.com**

This structure works seamlessly with Render's deployment options:
- **Static Site**: Deploy frontend from `apps/client/`
- **Web Service**: Deploy backend from `apps/server/`
- **Blueprint**: Deploy both services together

Your Nigerian real estate investment platform is now structured for enterprise-scale growth with professional separation of concerns!