FROM node:20-alpine
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install

# Copy source code and shared utilities
COPY server/ ./server/
COPY shared/ ./shared/

# Build the application to resolve TypeScript paths
RUN npm run build

# Start the built application
CMD ["npm", "run", "start"]