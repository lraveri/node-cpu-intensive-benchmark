FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

ENV SERVER_PATH=src/01-single-thread/server.js

CMD ["sh", "-c", "node $SERVER_PATH"]
