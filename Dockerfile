FROM node:16.4.0

WORKDIR /app/
RUN apt-get update && apt-get install -y python3-pip && python3 -m pip install --upgrade pip && \
    pip3 install mkdocs==1.3.0 mkdocstrings==0.18.0 mkdocs-material==8.2.16

COPY package.json .
COPY package-lock.json .
RUN touch /app/.env
RUN npm ci

COPY . .

ENV NODE_ENV=production

RUN npm run build

EXPOSE 4004

CMD npm start
