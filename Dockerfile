# syntax=docker/dockerfile:1
ARG NODE_VERSION=20.12.2
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /home/node/app
RUN chown -R node:node /home/node/app
COPY --chown=node:node package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY --chown=node:node . .
EXPOSE 3000

# Development build
FROM base AS dev
ENV NODE_ENV=development
RUN npm install -g nodemon ts-node
USER node
CMD ["yarn", "dev"]

# Production build
FROM base AS prod
ENV NODE_ENV=production
USER node
RUN mkdir build
RUN chown -R node:node build
RUN yarn build
CMD ["yarn", "start"]
