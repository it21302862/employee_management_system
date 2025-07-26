# Use Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Expose backend port
EXPOSE 8000

# Start the backend
CMD ["npm", "start"]
