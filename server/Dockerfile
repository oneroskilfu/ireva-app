FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.* ./
COPY esbuild.config.js ./
COPY server ./server
COPY shared ./shared
COPY client ./client

RUN npm install
RUN npx vite build --outDir dist/public
RUN node esbuild.config.js

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/index.js"]