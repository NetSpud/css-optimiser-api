# syntax=docker/dockerfile:1

# Use a specific Node.js version
ARG NODE_VERSION=20.12.2

FROM node:${NODE_VERSION}-alpine

# Set environment to development (change to 'production' for production builds)
ENV NODE_ENV=development

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package files separately to leverage Docker caching
COPY package.json yarn.lock ./

# Install dependencies (includes dev dependencies in development mode)
RUN yarn install --frozen-lockfile

# Globally install development tools if needed
RUN npm install -g nodemon ts-node

# Copy the rest of the application source code
COPY . .

# Ensure a non-root user is used to run the application
USER node

# Expose the application's port
EXPOSE 3000

# Command to start the application
CMD ["yarn", "dev"]
