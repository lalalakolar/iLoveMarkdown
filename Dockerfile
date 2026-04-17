# 构建阶段
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx wasp build

# 运行阶段
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.wasp/build .
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server/index.js"]