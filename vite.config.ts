import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'prompt',
        includeAssets: [
          'apple-touch-icon.png',
          'icon.svg',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
          'screenshot-wide.png',
          'screenshot-narrow.png',
          'privacy.html',
          'terms.html',
        ],
        manifest: {
          id: '/',
          name: 'GRAVFLIP',
          short_name: 'GRAVFLIP',
          description: 'The Gravity Is Your Weapon - A mobile-first futuristic neon 2D gravity-flipping platformer.',
          theme_color: '#0B0F0C',
          background_color: '#0B0F0C',
          display: 'fullscreen',
          display_override: ['fullscreen', 'standalone', 'minimal-ui', 'browser'],
          orientation: 'landscape',
          start_url: '/',
          scope: '/',
          lang: 'en',
          dir: 'ltr',
          categories: ['games', 'entertainment', 'arcade'],
          prefer_related_applications: false,
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          screenshots: [
            {
              src: '/screenshot-wide.png',
              sizes: '1280x576',
              type: 'image/png',
              form_factor: 'wide',
              label: 'GRAVFLIP Landscape Gameplay',
            },
            {
              src: '/screenshot-narrow.png',
              sizes: '720x1280',
              type: 'image/png',
              form_factor: 'narrow',
              label: 'GRAVFLIP Mobile Play',
            },
          ],
          shortcuts: [
            {
              name: 'Play Game',
              short_name: 'Play',
              description: 'Start playing GRAVFLIP immediately',
              url: '/',
              icons: [
                {
                  src: '/pwa-192x192.png',
                  sizes: '192x192',
                  type: 'image/png',
                },
              ],
            },
            {
              name: 'Level Select',
              short_name: 'Levels',
              description: 'Browse all 40 handcrafted worlds and levels',
              url: '/',
              icons: [
                {
                  src: '/pwa-192x192.png',
                  sizes: '192x192',
                  type: 'image/png',
                },
              ],
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
