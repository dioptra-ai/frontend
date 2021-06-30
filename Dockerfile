FROM node:16
MAINTAINER "Jacques Arnoux <jacques@dioptra.ai>"

RUN mkdir -p /app/src/client/

WORKDIR /app/src/client/
COPY ./src/client/package.json .
COPY ./src/client/package-lock.json .
RUN npm install

WORKDIR /app/
COPY package.json .
COPY package-lock.json .
RUN npm install

COPY . .

WORKDIR /app/src/client/
RUN npm run build

EXPOSE 4004

WORKDIR /app/
CMD npm start
