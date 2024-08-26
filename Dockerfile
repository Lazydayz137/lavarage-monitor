# Use an official Node.js runtime as the base image
FROM node:18
# Set NODE_ENV to production
# ENV NODE_ENV=production

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the ports the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start"]

