import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// public/icon.svg 하나에서 PWA 아이콘(64/192/512, maskable, apple-touch-icon)을 만든다.
// 다시 만들려면: npm run generate-icons
// favicon.ico는 여기서 만들지 않는다. (전용 디자인이라 npm run generate-favicon 으로 따로 만든다)
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    transparent: { ...minimal2023Preset.transparent, favicons: [] },
    maskable: { sizes: [512], padding: 0.2, resizeOptions: { background: '#FBF3E6' } },
    apple: { sizes: [180], padding: 0.1, resizeOptions: { background: '#FBF3E6' } },
  },
  images: ['public/icon.svg'],
});
