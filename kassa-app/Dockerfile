FROM node:16-alpine AS build

RUN apk update && apk add make && apk add build-base

WORKDIR /usr/src/app

COPY package*.json .
RUN npm ci

COPY . .
RUN npm run build

# Stage 2
FROM nginx:1.17.1-alpine
EXPOSE 80
COPY --from=build /usr/src/app/dist/kassa /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

