# ---- Build frontend ----
FROM node:20-alpine AS frontend
WORKDIR /app
COPY package*.json ./
COPY client ./client
COPY shared ./shared
RUN npm install
WORKDIR /app/client
RUN npm run build

# ---- Build backend ----
FROM node:20-alpine AS backend
WORKDIR /app
COPY package*.json ./
COPY tsconfig.* ./
COPY esbuild.config.js ./
COPY server ./server
COPY shared ./shared
RUN npm install
RUN node esbuild.config.js

# ---- Final runtime ----
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=backend /app/dist ./dist
COPY --from=frontend /app/client/dist ./dist/public
EXPOSE 5000
CMD ["node", "dist/index.js"]