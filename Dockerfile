# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 安装wasp
RUN apk add --no-cache curl bash
RUN curl -sSL https://get.wasp-lang.dev/installer.sh | sh

COPY package*.json ./
RUN npm ci

COPY . .

# 生产环境构建
ENV WASP_ENV=production
RUN wasp build

# 运行阶段
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/.wasp/build .

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server/index.js"]