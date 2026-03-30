# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build:prod

# Stage 2: Runtime
FROM nginx:alpine AS runtime
COPY --from=build /app/dist/manchita-skills-frontend/browser /usr/share/nginx/html
EXPOSE 80
