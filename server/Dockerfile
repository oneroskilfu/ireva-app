FROM node:18-alpine
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and shared utilities
COPY server/ ./server/
COPY shared/ ./shared/

# Build backend if needed
RUN npm run build 2>/dev/null || echo "No build script found"

# Start application
CMD ["npm", "run", "start"]