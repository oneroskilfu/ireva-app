FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Build application
FROM deps AS builder
COPY . .
RUN npm run build

# Production image
FROM base AS runner
ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nodeuser

# Copy built files from builder stage
COPY --from=builder --chown=nodeuser:nodejs /app/build ./build
COPY --from=builder --chown=nodeuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodeuser:nodejs /app/package.json ./package.json

# Create uploads directory with proper permissions
RUN mkdir -p uploads/logos \
    && chown -R nodeuser:nodejs /app

# Switch to non-root user
USER nodeuser

# Expose ports - 5000 for API, 3000 for web
EXPOSE 5000
EXPOSE 3000

# Default command
CMD ["npm", "run", "start"]