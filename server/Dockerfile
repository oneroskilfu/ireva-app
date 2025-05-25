FROM node:20-alpine
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install

# Copy source code and shared utilities
COPY server/ ./server/
COPY shared/ ./shared/

# Build only the backend part
RUN npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Start the built application
CMD ["npm", "run", "start"]