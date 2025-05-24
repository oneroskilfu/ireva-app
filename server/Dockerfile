# Backend Dockerfile for iREVA Platform
# Optimized for standalone backend deployment

# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY server/package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install --omit=dev

# Copy source code and shared utilities
COPY server/ .
COPY shared/ ./shared/

# Build backend if needed
RUN npm run build 2>/dev/null || echo "No build script found"

# Production stage
FROM node:18-alpine AS production

# Install production dependencies and create user
RUN apk add --no-cache dumb-init \
    && addgroup -g 1001 -S nodejs \
    && adduser -S ireva -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=ireva:nodejs /app .

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Use non-root user
USER ireva

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { \
        process.exit(res.statusCode === 200 ? 0 : 1); \
    }).on('error', () => process.exit(1));"

# Expose port
EXPOSE 3000

# Start application with proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start"]