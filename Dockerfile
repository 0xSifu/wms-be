# Stage 1: Build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY prisma ./prisma/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN yarn prisma generate

# Build the application
RUN yarn run build

# Stage 2: Production
FROM node:20-alpine

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

# Set environment variables
ENV APP_NAME="@pmi/wms-pmi-be" \
    APP_ENV="staging" \
    HTTP_ENABLE=true \
    HTTP_HOST="0.0.0.0" \
    HTTP_PORT=9001 \
    HTTP_VERSIONING_ENABLE=true \
    HTTP_VERSION=1 \
    ACCESS_TOKEN_SECRET_KEY="testme" \
    ACCESS_TOKEN_EXPIRED="1d" \
    REFRESH_TOKEN_SECRET_KEY="testme" \
    REFRESH_TOKEN_EXPIRED="7d" \
    RABBITMQ_URL="amqp://admin:master123@localhost:5672" \
    RABBITMQ_AUTH_QUEUE="auth_queue" \
    RABBITMQ_TAG_QUEUE="tag_queue" \
    RABBITMQ_PRODUCT_QUEUE="product_queue" \
    DATABASE_URL="postgresql://postgres:P@ssw0rd@localhost:5432/postgres?schema=public" \
    NODE_ENV=production

# Expose the configured port
EXPOSE ${HTTP_PORT}

# Add a healthcheck (optional)
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${HTTP_PORT}/health || exit 1

# Run the application
CMD ["yarn", "run", "start:prod"]
