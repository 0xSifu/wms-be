# Stage 1: Build
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN yarn prisma generate

# Copy the rest of the application code
COPY . .

# Build the application
RUN yarn run build

# Stage 2: Production
FROM node:20-slim

# Install necessary system dependencies
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create a non-root user (Debian style)
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY prisma ./prisma/

# Install only production dependencies
RUN yarn install --production --frozen-lockfile

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma/client  ./node_modules/.prisma/client

# Generate Prisma client again to ensure compatibility
RUN yarn prisma generate

# Copy .env file
COPY .env ./

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:9001/health || exit 1

# Expose the port
EXPOSE 9001

# Start the application
CMD ["yarn", "run", "start:prod"]
