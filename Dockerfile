# Define build arguments
ARG NODE_VERSION=20-alpine3.19
ARG DUMB_INIT_VERSION=1.2.5-r2

# Base stage
FROM node:${NODE_VERSION} AS base
ENV DIR=/app
WORKDIR $DIR
COPY package*.json ./

# Development stage
FROM base AS dev
RUN npm install
COPY . .
RUN npx prisma generate
ARG PORT=80
EXPOSE $PORT
CMD ["npm", "run", "start:dev"]

# Build stage
FROM base AS build
ARG DUMB_INIT_VERSION
RUN apk update && apk add --no-cache dumb-init=${DUMB_INIT_VERSION}
COPY . .
RUN npm ci
RUN npx prisma generate --generator client
RUN npm run build && npm ci --production

# Production stage
FROM node:${NODE_VERSION} AS production
ENV USER=root
WORKDIR /app

# Copy necessary files from build stage
COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/dist dist
COPY --from=build /app/prisma prisma

ARG PORT=80
EXPOSE $PORT
CMD ["dumb-init", "node", "dist/main.js"]
