# Multi-stage Dockerfile for iREVA Platform
# Optimized for Render.com deployment with frontend and backend

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy frontend package files explicitly
COPY client/package*.json ./
COPY package*.json ./package.json

# Create cache mount for faster builds
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/app/node_modules/.cache \
    npm install --omit=dev

# Copy frontend source and shared utilities  
COPY client/ .
COPY shared/ ./shared/

# Copy frontend-specific environment configuration  
COPY .env.frontend .env.production ./

# Build frontend for production with build cache
RUN --mount=type=cache,target=/app/node_modules/.cache \
    npm run build

# Stage 2: Build Backend
FROM node:18-alpine AS backend-builder

WORKDIR /app

# Copy backend package files explicitly
COPY server/package*.json ./
COPY package*.json ./package.json

# Create cache mount for faster builds
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/app/node_modules/.cache \
    npm install --omit=dev

# Copy backend source and shared utilities
COPY server/ .
COPY shared/ ./shared/

# Copy backend-specific environment configuration
COPY .env.backend .env.production ./

# Build backend if needed
RUN npm run build 2>/dev/null || echo "No build script found"

# Stage 3: Production Runtime
FROM node:18-alpine AS production

# Install production dependencies
RUN apk add --no-cache \
    dumb-init \
    && addgroup -g 1001 -S nodejs \
    && adduser -S ireva -u 1001

WORKDIR /app

# Copy built applications (using correct Vite output path)
COPY --from=frontend-builder --chown=ireva:nodejs /app/dist/public ./public
# Copy nginx configuration for SPA routing
COPY --from=frontend-builder --chown=ireva:nodejs /app/client/nginx.conf ./nginx.conf
COPY --from=backend-builder --chown=ireva:nodejs /app/server ./server
COPY --from=backend-builder --chown=ireva:nodejs /app/shared ./shared
COPY --chown=ireva:nodejs package*.json ./

# Copy production environment configuration
COPY --chown=ireva:nodejs .env.production ./

# Install only production dependencies at root level with caching
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/app/node_modules/.cache \
    npm install --omit=dev && npm cache clean --force

# Copy server dependencies
COPY --from=backend-builder --chown=ireva:nodejs /app/server/node_modules ./server/node_modules

# Set production environment
ENV NODE_ENV=production
ENV PORT=10000
ENV FRONTEND_BUILD_PATH=/app/public

# Use non-root user
USER ireva

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:10000/api/health', (res) => { \
        process.exit(res.statusCode === 200 ? 0 : 1); \
    }).on('error', () => process.exit(1));"

# Expose port
EXPOSE 10000

# Start application with proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/index.js"]