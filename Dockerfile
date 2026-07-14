FROM node:22-alpine

WORKDIR /app

# Copy all files
COPY . .

# Install dependencies with force to bypass conflicts
RUN npm install --force

# Build the application
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
