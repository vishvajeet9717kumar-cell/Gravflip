/**
 * PWA Service Worker & Lifecycle Manager
 * Handles iframe detection, quiet fallback, update notifications, and reload dispatch.
 */

export type PWAUpdateListener = () => void;

let updateListener: PWAUpdateListener | null = null;
let activeRegistration: ServiceWorkerRegistration | null = null;

export function registerPWA(onUpdateAvailable?: PWAUpdateListener): () => void {
  updateListener = onUpdateAvailable || null;

  // 1. If running inside an iframe or preview where service workers are not allowed, skip registration quietly
  const isInsideIframe = (() => {
    try {
      return window.self !== window.top;
    } catch (_) {
      return true;
    }
  })();

  if (isInsideIframe || typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return () => {};
  }

  // 2. Register service worker only in secure contexts or localhost
  const isSecure = window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (!isSecure) {
    return () => {};
  }

  let refreshing = false;
  const handleControllerChange = () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  };

  try {
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        activeRegistration = registration;

        // If there is already a waiting service worker, trigger update message
        if (registration.waiting && updateListener) {
          updateListener();
        }

        // Listen for new updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              if (updateListener) {
                updateListener();
              }
            }
          });
        });
      })
      .catch(() => {
        // Quietly ignore registration error in sandboxed/preview environments without console errors
      });
  } catch (_) {
    // Quietly ignore
  }

  return () => {
    try {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    } catch (_) {}
  };
}

/**
 * Triggers the waiting Service Worker to skipWaiting and reloads the application.
 */
export function applyPWAUpdate(): void {
  if (activeRegistration?.waiting) {
    activeRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
  } else if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg?.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      } else {
        window.location.reload();
      }
    }).catch(() => {
      window.location.reload();
    });
  } else {
    window.location.reload();
  }
}
