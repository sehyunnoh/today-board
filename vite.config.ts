import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages 하위 경로(https://sehyunnoh.github.io/today-board/)에서 서비스된다.
const BASE = '/today-board/';

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      // 새 버전이 나오면 자동 교체하지 않고 "새 버전이 있어요" 알림을 띄운다. (체크 중에 화면이 바뀌는 걸 막기 위해)
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon-180x180.png', 'icon.svg'],
      manifest: {
        name: 'Today Board',
        short_name: 'Today Board',
        description: '매일 해야 할 일을 챙기는 Daily 체크리스트',
        lang: 'ko',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#FBF3E6',
        theme_color: '#FBF3E6',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        navigateFallback: `${BASE}index.html`,
        cleanupOutdatedCaches: true,
        // 글꼴(Pretendard)은 한 번 받으면 오프라인에서도 쓰도록 캐시한다.
        // GitHub API, 날씨, 환율 요청은 서비스 워커가 건드리지 않는다. (토큰이 담긴 요청을 캐시하지 않기 위해)
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://cdn.jsdelivr.net',
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts',
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  test: { environment: 'node' },
});
