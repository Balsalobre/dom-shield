# Multi-stage build for DOM Shield
# Stage 1: Build the library
FROM node:alpine AS builder

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the library
RUN pnpm build

# Stage 2: Production image with nginx
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/dist/dom-shield.umd.js /usr/share/nginx/html/
COPY demo/ /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1
