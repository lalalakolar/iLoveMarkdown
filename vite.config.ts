import { wasp } from "wasp/client/vite"
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [wasp(), tailwindcss()],
  server: {
    open: true,
  },
  // CDN配置
  base: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.ilovemarkdown.org/' // 生产环境CDN地址
    : '/', // 开发环境本地地址
  // 构建配置
  build: {
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 启用动态导入
    dynamicImportVars: true,
    // 生产环境构建选项
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
});
