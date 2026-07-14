# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install production dependencies only
RUN npm install --force --omit=dev

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port (Render will use PORT env var, but we expose 3000 as default)
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
