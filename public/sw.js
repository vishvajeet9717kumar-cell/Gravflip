/**
 * GRAVFLIP PWA Service Worker
 * Versioned offline cache for 100% offline gameplay.
 * Does not intercept or interfere with browser localStorage.
 */

const CACHE_VERSION = 'gravflip-v1.0.1';
const CACHE_NAME = `gravflip-cache-${CACHE_VERSION}`;

// Core assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/screenshot-wide.png',
  '/screenshot-narrow.png',
  '/privacy.html',
  '/terms.html',
];

// Install: pre-cache shell and assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[GRAVFLIP SW] Precache warning:', err);
      });
    })
  );
  // Do not automatically skipWaiting - allow user to see update prompt
});

// Activate: clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key.startsWith('gravflip-cache-')) {
            console.log('[GRAVFLIP SW] Purging old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// User-initiated update trigger
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch handler: Stale-While-Revalidate for static assets, Network-First for HTML navigation
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET requests
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Skip chrome-extension, internal schemes, and socket/HMR requests
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (url.pathname.includes('/@vite/') || url.pathname.includes('/@fs/')) return;

  // HTML Navigation: Network first with Cache fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          const indexCached = await caches.match('/index.html');
          if (indexCached) return indexCached;
          return caches.match('/');
        })
    );
    return;
  }

  // Static Assets (Scripts, CSS, Images, Fonts, Audio): Cache First, then Network
  event.respondWith(
    caches.match(req).then((cachedRes) => {
      if (cachedRes) {
        // Fetch in background to update cache for next load
        fetch(req)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(req, networkRes));
            }
          })
          .catch(() => {});
        return cachedRes;
      }

      return fetch(req).then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return networkRes;
      });
    })
  );
});
