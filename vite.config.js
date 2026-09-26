import { defineConfig } from 'vite';

// @author ygw
export default defineConfig({
  base: './',
  build: {
    // 现代浏览器目标，启用更高效的语法输出
    target: 'es2020',
    // 大型地理数据 JSON 文件的 chunk 警告阈值
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // 将第三方依赖独立分包，利用浏览器缓存
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
});
