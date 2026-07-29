FROM node:22-slim
WORKDIR /app

# Install system essentials for Prisma 7 engines and external shell tooling
RUN apt-get update && apt-get install -y openssl git curl && rm -rf /var/lib/apt/lists/*

# Copy package descriptors first to maximize layer caching efficiency
COPY package*.json ./
RUN npm install

# Copy application files (including your prisma/schema.prisma)
COPY . .

# Explicitly force generation into your schema's specified output target path
RUN npx prisma generate

# Compile TypeScript v6 into plain JavaScript code
RUN npm run build

CMD ["node", "dist/index.js"]
