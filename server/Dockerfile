FROM node:18-alpine
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and shared utilities
COPY server/ ./server/
COPY shared/ ./shared/

# Install tsx globally for TypeScript execution
RUN npm install -g tsx

# For production, we'll run the TypeScript directly since the build creates dist in root
CMD ["tsx", "server/index.ts"]