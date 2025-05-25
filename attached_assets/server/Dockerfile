# ---- Build frontend ----
FROM node:20-alpine AS frontend
WORKDIR /app
COPY client/package*.json ./client/
COPY client/vite.config.* ./client/
COPY client/tsconfig.* ./client/
COPY client/public ./client/public
COPY client/src ./client/src
RUN cd client && npm install
RUN cd client && npm run build

# ---- Build backend ----
FROM node:20-alpine AS backend
WORKDIR /app
COPY server/package*.json ./
COPY server/tsconfig.* ./
COPY server/esbuild.config.js ./
COPY server/src ./src
COPY server/.env ./
RUN npm install
RUN node esbuild.config.js

# ---- Final runtime ----
FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./
COPY server/.env ./
RUN npm install --omit=dev
COPY --from=backend /app/dist ./dist
COPY --from=frontend /app/client/dist ./dist/public
EXPOSE 5000
CMD ["node", "dist/index.js"]
