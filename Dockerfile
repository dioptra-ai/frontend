FROM node:16
MAINTAINER "Jacques Arnoux <jacques@dioptra.ai>"

WORKDIR /app/
COPY package.json .
COPY package-lock.json .
RUN npm ci

COPY . .

RUN npm run build:frontend

EXPOSE 4004

CMD npm start