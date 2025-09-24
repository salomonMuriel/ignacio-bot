# Multi-stage build for production React app

# Stage 1: Build the React application
FROM node:20-alpine as build

# Install curl for health checks in build stage if needed
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install ALL dependencies (dev dependencies needed for build)
RUN npm ci

# Copy source code
COPY . .

# Copy production environment file
COPY .env.production .env.production

# Build the application
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.29.1-alpine

# Install curl for health checks and envsubst for template substitution
RUN apk add --no-cache curl gettext

# Copy nginx configuration template and entrypoint script
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chmod -R 755 /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1

# Start nginx with environment variable substitution
CMD ["/entrypoint.sh"]