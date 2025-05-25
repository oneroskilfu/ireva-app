FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.* ./
COPY esbuild.config.js ./
COPY server ./server
COPY shared ./shared

RUN npm install
RUN node esbuild.config.js

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/index.js"]