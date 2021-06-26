FROM node:16
MAINTAINER "Jacques Arnoux <jacques@dioptra.ai>"

COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
RUN npm install

COPY . .

CMD npm start
