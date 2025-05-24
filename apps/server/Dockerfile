# Backend Dockerfile for iREVA Platform
# Optimized for Express + TypeScript deployment

# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY apps/server/package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production

# Copy source code
COPY apps/server/ ./
COPY shared/ ./shared/

# Build if TypeScript compilation is needed
RUN npm run build 2>/dev/null || echo "No build step required"

# Production stage
FROM node:18-alpine AS production

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S ireva -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=ireva:nodejs /app ./

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Switch to non-root user
USER ireva

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { \
        process.exit(res.statusCode === 200 ? 0 : 1); \
    }).on('error', () => process.exit(1));"

EXPOSE 5000
CMD ["npm", "start"]