# 构建阶段
FROM node:20-alpine AS builder
WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache bash

# 官方新版：npm 全局安装Wasp CLI（不再用curl脚本！）
RUN npm config set registry https://registry.npmmirror.com \
    && npm install -g @wasp-lang/wasp-cli

# 安装项目依赖
COPY package*.json ./
RUN npm ci

# 拷贝全部代码
COPY . .

# 生产环境打包
ENV WASP_ENV=production
RUN wasp build

# 纯净运行镜像
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.wasp/build .

ENV PORT=8080
EXPOSE 8080
CMD ["node", "server/index.js"]