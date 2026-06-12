FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --force

RUN npm install uuid@8.3.2 --save --force

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
