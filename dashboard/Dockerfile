#FROM node:19 AS build
#WORKDIR /usr/src/app
#COPY ./package*.json .
#RUN npm install
#COPY . .
#RUN npm run build --prod

# Stage 2: Serve the built app with nginx
#FROM nginx:1.17.1-alpine
#COPY --from=build /usr/src/app/dist/dashboard /usr/share/nginx/html
#COPY ./nginx.conf /etc/nginx/conf.d/default.conf

FROM node:20 AS builder
WORKDIR /app
COPY ./package*.json .
RUN npm install 
COPY . .
RUN npm run build

FROM nginx:1.17.1-alpine
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/dist/dashboard .

