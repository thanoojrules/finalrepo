# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the application code
COPY . .

# Expose the necessary port
EXPOSE 8080

# Set the environment variable for the database connection string
ENV DATABASE_URL="postgres://thanooj:T#@nOOj@0899@bigbankdbserver.postgres.database.azure.com:5432/bigbankdb"

# Command to run the application
CMD ["npm", "start"]

#......