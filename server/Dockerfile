FROM node:20-alpine
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY tsconfig.json ./
COPY esbuild.config.js ./
RUN npm install

# Copy source code and shared utilities
COPY server/ ./server/
COPY shared/ ./shared/

# Build the backend using esbuild configuration
RUN node esbuild.config.js

# Start the built application
CMD ["node", "dist/index.js"]