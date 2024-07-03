# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:20 as build-stage

WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY ./ /app/

RUN npm run build

# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1

COPY --from=build-stage /app/.next /usr/share/nginx/html/.next
COPY --from=build-stage /app/public /usr/share/nginx/html/public
COPY --from=build-stage /app/next.config.mjs /usr/share/nginx/html/next.config.mjs

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY ./nginx-backend-not-found.conf /etc/nginx/extra-conf.d/backend-not-found.conf
