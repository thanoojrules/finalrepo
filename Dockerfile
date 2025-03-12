# Stage 1: Build backend
FROM node:18 AS backend-build

WORKDIR /app

# Copy backend package.json and install dependencies
COPY backend/package.json backend/
RUN cd backend && npm install

# Stage 2: Create final image for both frontend and backend
FROM node:18

WORKDIR /app

# Copy backend code into the image
COPY --from=backend-build /app/backend /app/backend

# Copy frontend static files into backend's public folder
COPY frontend /app/backend/public

# Expose the necessary port
EXPOSE 3000

# Set the environment variable for the database connection string
ENV DATABASE_URL="postgres://thanooj:T#@nOOj@0899@bigbankdbserver.postgres.database.azure.com:5432/bigbankdb"

# Command to run the application
CMD ["node", "backend/server.js"]