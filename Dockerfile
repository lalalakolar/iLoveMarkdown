# --------------- 最终可用版 ---------------
FROM node:20-alpine AS builder
WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache curl bash

# 官方唯一正确安装 Wasp 的方式（只有这个能成功）
RUN curl -sSL https://get.wasp-lang.dev/installer.sh | sh -s -- -v 0.19.0
ENV PATH="/root/.local/bin:$PATH"

# 安装依赖
COPY package*.json ./
RUN npm install

# 复制项目
COPY . .

# 构建
ENV WASP_ENV=production
RUN wasp build

# 运行阶段
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.wasp/build .

ENV PORT=8080
EXPOSE 8080
CMD ["node", "server/index.js"]