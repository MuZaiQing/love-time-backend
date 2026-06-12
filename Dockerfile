FROM node:18-alpine

WORKDIR /app

COPY server/package.json server/package-lock.json ./

RUN npm install --force

RUN npm install uuid@8.3.2 --save --force

COPY server/ ./

EXPOSE 3000

CMD ["node", "index.js"]
