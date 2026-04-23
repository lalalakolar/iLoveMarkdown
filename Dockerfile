FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache curl bash

# 🔥 官方最新正确安装命令（必须带版本号！）
RUN curl -sSL https://get.wasp.sh/installer.sh | sh -s -- -v 0.21.0
ENV PATH="/root/.local/bin:$PATH"

COPY package*.json ./
RUN npm ci

COPY . .

ENV WASP_ENV=production
RUN wasp build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.wasp/build .

ENV PORT=8080
EXPOSE 8080
CMD ["node", "server/index.js"]