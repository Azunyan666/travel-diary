import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * base 有三套：
 * - Capacitor APK：相对路径 './'，WebView 从 https://localhost/ 加载
 * - GitHub Pages：'/travel-diary/'
 * - 本地开发：'/'
 *
 * APK 内不启用 PWA：Service Worker 在 WebView 里会缓存旧资源，升级后容易出现旧版本甚至白屏。
 */
const isCapacitor = process.env.CAPACITOR === '1'
const base = isCapacitor ? './' : process.env.GITHUB_ACTIONS ? '/travel-diary/' : '/'

export default defineConfig({
  base,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    vue(),
    ...(isCapacitor
      ? []
      : [
          VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
            manifest: {
              name: '行迹 · 旅行日记',
              short_name: '行迹',
              description: '给照片写故事，让足迹在地图上亮起来。',
              lang: 'zh-CN',
              theme_color: '#F7F3EA',
              background_color: '#F7F3EA',
              display: 'standalone',
              orientation: 'portrait',
              start_url: base,
              scope: base,
              icons: [
                { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
                { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
                {
                  src: 'icons/icon-maskable-512.png',
                  sizes: '512x512',
                  type: 'image/png',
                  purpose: 'maskable',
                },
              ],
            },
            workbox: {
              globPatterns: ['**/*.{js,css,html,svg,png,json,webmanifest}'],
              navigateFallback: 'index.html',
            },
            devOptions: {
              enabled: false,
            },
          }),
        ]),
  ],
})
