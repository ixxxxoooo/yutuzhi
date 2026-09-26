import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// @author ygw

/** 生产构建时把字体 preload 链接注入到 index.html（指向带 hash 的产物） */
function fontPreloadPlugin() {
  return {
    name: 'font-preload',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html;
        const fontFile = Object.keys(ctx.bundle).find(k => k.endsWith('.woff2'));
        if (!fontFile) return html;
        const tag = `<link rel="preload" href="./${fontFile}" as="font" type="font/woff2" crossorigin>`;
        return html
          .replace(/<link rel="preload" href="\/src\/fonts\/cityex-sans\.woff2"[^>]*>/, tag)
          .replace('href="/og.jpg"', 'href="./og.jpg"');
      },
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [
    fontPreloadPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['og.jpg'],
      manifest: {
        name: 'YuTuZhi 舆图志',
        short_name: '舆图志',
        description: '中国省、市、区县、乡镇/街道四级行政区划交互探索地图',
        theme_color: '#f3efe6',
        background_color: '#f3efe6',
        display: 'standalone',
        lang: 'zh-Hans',
        start_url: './',
        icons: [
          {
            src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"%3E%3Crect x="3" y="4" width="26" height="24" rx="6" fill="%23FACC15" stroke="%23222" stroke-width="3"/%3E%3Cpath d="M9 20l5-8 4 5 3-4 3 7z" fill="%23fff" stroke="%23222" stroke-width="2" stroke-linejoin="round"/%3E%3C/svg%3E',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,jpg,svg,json}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /\/assets\/.*\.(?:js|css|woff2)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'yutuzhi-assets',
              expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /towns\/.*\.json$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'yutuzhi-towns' },
          },
        ],
      },
    }),
  ],
  build: {
    target: 'es2022',
    sourcemap: true,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js', 'tests/**/*.test.js'],
  },
});
