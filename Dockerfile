# Build Stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for typescript)
RUN npm ci

# Copy source code
COPY . .

# Build the TypeScript project
RUN npm run build

# Production Stage
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install only production dependencies for a smaller image
RUN npm ci --omit=dev

# Copy the compiled output from the builder stage
COPY --from=builder /app/dist ./dist

# Create a non-root user for enhanced security
RUN addgroup -g 1001 -S cdn && \
    adduser -u 1001 -S cdn -G cdn

# Change ownership of the app directory
RUN chown -R cdn:cdn /app

# Switch to the non-root user
USER cdn

# Expose the standard port
EXPOSE 8080

CMD ["node", "dist/server.js"]
