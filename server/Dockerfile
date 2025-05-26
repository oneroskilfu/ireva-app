# ---- Build frontend ----
FROM node:20-alpine AS frontend
WORKDIR /app
COPY package*.json ./
COPY client ./client
COPY shared ./shared
RUN npm install

# Install client dependencies separately
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
RUN npm run build

# ---- Build backend ----
FROM node:20-alpine AS backend
WORKDIR /app
COPY server/package*.json ./server/
COPY tsconfig.* ./
COPY esbuild.config.js ./
COPY server ./server
COPY shared ./shared

# Install only backend dependencies
WORKDIR /app/server
RUN npm install
RUN npm run build

# ---- Final runtime ----
FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm install --omit=dev
COPY --from=backend /app/dist ./dist
COPY --from=frontend /app/client/dist ./dist/public
EXPOSE 5000
CMD ["node", "dist/index.js"]