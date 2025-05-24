FROM node:18-alpine

WORKDIR /app

COPY apps/server/package*.json ./
RUN npm install

COPY apps/server .

RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start"]