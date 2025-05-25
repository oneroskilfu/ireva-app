FROM node:20-alpine
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install

# Copy source code and shared utilities
COPY server/ ./server/
COPY shared/ ./shared/

# Install tsx globally for TypeScript execution
RUN npm install -g tsx

# Start application directly with tsx (no build needed)
CMD ["tsx", "server/index.ts"]