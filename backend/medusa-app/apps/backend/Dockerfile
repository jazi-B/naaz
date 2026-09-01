FROM node:22-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build backend + admin dashboard (2GB heap so Vite doesn't OOM)
RUN NODE_OPTIONS=--max-old-space-size=2048 npm run build

# Expose port
EXPOSE 9000

# Run migrations then start server
CMD npx medusa db:migrate && npx medusa start --port ${PORT:-9000}
