FROM node:10-alpine

WORKDIR /usr/src/app

COPY package.json /usr/src/app/package.json

RUN npm install 
#--loglevel error

COPY . /usr/src/app

RUN npm run build

EXPOSE 3000
