# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:20 as build-stage

WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of your app's source code
COPY . .

# Build your Next.js application
RUN npm run build

# Stage 1, based on Nginx, to serve the compiled app in production
FROM nginx:alpine

# Set working directory to nginx asset directory
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy static assets from builder stage
COPY --from=build-stage /app/.next /usr/share/nginx/html/.next
COPY --from=build-stage /app/public /usr/share/nginx/html/public
COPY --from=build-stage /app/next.config.js /usr/share/nginx/html/next.config.js

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]
