# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files from frontend directory (context is repo root)
COPY frontend/package*.json ./

# Install ALL dependencies (including devDependencies) for build
# terser is needed for production minification
RUN npm install --include=dev

# Copy frontend source
COPY frontend/ ./
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config (path relative to context which is repo root)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]



