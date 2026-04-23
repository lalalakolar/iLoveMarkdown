# 构建阶段
FROM node:20-alpine AS builder
WORKDIR /app

# 安装依赖
RUN apk add --no-cache curl bash

# 安装 Wasp 并强制加入 PATH（解决你报的警告！）
RUN curl -sSL https://get.wasp-lang.dev/installer.sh | sh
ENV PATH="/root/.local/bin:$PATH"

# 验证是否安装成功
RUN wasp --version

# 安装项目依赖
COPY package*.json ./
RUN npm ci

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