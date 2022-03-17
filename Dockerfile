FROM node:16.4.0
MAINTAINER "Jacques Arnoux <jacques@dioptra.ai>"

WORKDIR /app/
COPY package.json .
COPY package-lock.json .
RUN touch /app/.env
RUN npm ci

COPY ./submodules submodules/
RUN apt-get update && apt-get install -y python3-pip && python3 -m pip install --upgrade pip
RUN pip3 install mkdocs mkdocstrings mkdocs-material
RUN pip3 install -r submodules/collector-py-private/requirements.txt

COPY . .

RUN PYTHONPATH=submodules/collector-py-private mkdocs build

RUN npm run build:frontend

EXPOSE 4004

CMD npm start
