FROM node:22-slim

WORKDIR /app

# Install ALL dependencies (including devDeps needed by medusa CLI)
COPY package*.json ./
RUN npm install

# Copy source + pre-built .medusa directory
COPY . .

# Copy compiled config to project root (required by medusa start in production)
RUN cp .medusa/server/medusa-config.js medusa-config.js

# Expose port
EXPOSE 9000

# Set NODE_ENV=production so medusa uses compiled .medusa/server (not ts-node)
ENV NODE_ENV=production

# Run migrations then start server
CMD npx medusa db:migrate && npx medusa start --port ${PORT:-9000}
