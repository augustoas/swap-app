# Use the official Node.js image as the base image
FROM node:24-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install app dependencies
RUN npm ci

# Copy the rest of the application code to the container
COPY . .

# Expose the port your Nuxt.js app is running on
EXPOSE 3000

# Default command for development (can be overridden in docker-compose)
CMD ["npm", "run", "dev"]