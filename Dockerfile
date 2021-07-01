FROM node:16
MAINTAINER "Jacques Arnoux <jacques@dioptra.ai>"

COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
RUN npm ci

COPY . .

CMD npm start
