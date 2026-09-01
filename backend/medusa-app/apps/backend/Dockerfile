FROM node:22-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy source + pre-built .medusa directory
COPY . .

# Expose port
EXPOSE 9000

# Run migrations then start server
CMD npx medusa db:migrate && npx medusa start --port ${PORT:-9000}
