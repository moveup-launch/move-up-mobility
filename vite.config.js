import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Move Up App',
        short_name: 'Move Up',
        description: 'Assistant de visite déménagement',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0A0A0A',
        orientation: 'portrait',
        lang: 'fr',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,woff}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            // Données Supabase (table REST — visites, photos, profils...) :
            // jamais de cache. Avec NetworkFirst + repli sur cache 24h, une
            // connexion terrain lente (>5s) faisait afficher un instantané
            // périmé (ex: "aucune visite planifiée" alors que des visites
            // existaient déjà en base). Le repli hors-ligne pour l'écriture
            // est déjà géré côté app (moveup_pending_saves/moveup_offline_visits,
            // indépendant du service worker) — pas besoin de ce cache-ci.
            urlPattern: /^https:\/\/[^/]+\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            // Storage/Auth Supabase (photos signées, session) — comportement
            // inchangé, non concerné par le bug ci-dessus.
            urlPattern: /^https:\/\/[^/]+\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            // Google Fonts CSS
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-css',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // Google Fonts fichiers
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
});
