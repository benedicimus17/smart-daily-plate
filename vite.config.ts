import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      selfDestroying: true,
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
      },
      includeAssets: [
        'favicon.ico',
        'favicon.png',
        'apple-touch-icon.png',
        'apple-touch-icon-v6.png',
        'pwa-192x192.png',
        'pwa-192x192-v6.png',
        'pwa-512x512.png',
        'pwa-512x512-v6.png',
        'splash_studio_bg.jpg',
        'dinner_steak_hd.jpg',
      ],
      manifest: {
        name: 'NUTRIQ — Intelligent Nutrition',
        short_name: 'NUTRIQ',
        description: 'Intelligent Nutrition & Daily Balance Studio',
        theme_color: '#111613',
        background_color: '#111613',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/?v=6',
        scope: '/',
        icons: [
          {
            src: 'pwa-192x192-v6.png?v=6',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'pwa-512x512-v6.png?v=6',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
});
