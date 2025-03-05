# Use the official Azure Functions Node.js runtime
FROM mcr.microsoft.com/azure-functions/node:4

# Set the working directory inside the container
WORKDIR /home/site/wwwroot

# Copy package files first (to optimize caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy all other backend files
COPY . .

# Set environment variables for Azure Functions
ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__ConsoleLevel=Information \
    FUNCTIONS_WORKER_RUNTIME=node

# Start Azure Functions runtime
CMD ["func", "start", "--javascript"]
