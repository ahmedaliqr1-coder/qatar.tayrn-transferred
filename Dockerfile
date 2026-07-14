FROM node:22-alpine



WORKDIR /app



# Copy all files

COPY . .



# Install dependencies

RUN npm install --force



# Build the application

RUN npm run build



# Set environment variable for port

ENV PORT=3000



# Expose the port

EXPOSE 3000



# Start the application

CMD ["npm", "start"]



