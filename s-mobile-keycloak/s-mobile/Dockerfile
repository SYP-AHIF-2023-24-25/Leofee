
FROM node:18 AS dependencies

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

FROM dependencies AS build

COPY . .
RUN npm run build

FROM nginx:1.17.1-alpine

COPY --from=build /usr/src/app/dist/s-mobile/browser /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
