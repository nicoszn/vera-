FROM node:22-slim
WORKDIR /app
RUN apt-get update && apt-get install -y openssl git curl && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm install
COPY . .
# Generates the modern Rust-free client locally instead of system space node_modules
RUN npx prisma generate
RUN npm run build
CMD ["node", "dist/index.js"]
