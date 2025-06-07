FROM node:latest as frontend

WORKDIR /app

COPY ./package*.json ./

RUN npm install

COPY . .

RUN npm run build
