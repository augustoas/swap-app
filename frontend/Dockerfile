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

# Run the build command which creates the production bundle
RUN npm run build

# Expose the port your Nuxt.js app is running on
EXPOSE 3000

# Define the command to start your Nuxt.js app
CMD ["node", ".output/server/index.mjs"]