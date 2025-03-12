# Use official Node.js image as base
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (to leverage caching)
COPY package*.json ./

# Install dependencies (both frontend and backend)
RUN npm install

# Copy the entire project (backend & frontend) into the container
COPY . .


# Expose backend port
EXPOSE 3000

# Set the command to start the backend server
CMD ["node", "backend/server.js"]