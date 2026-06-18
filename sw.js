const CACHE_NAME = 'abhi-result-v2';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './data.js',
  './logo.png'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Claim clients immediately
  );
});

// Network-First strategy for HTML and JS/CSS files to avoid stale content
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // For HTML, JS, CSS, and dynamic pages, use Network-First strategy
  if (
    event.request.mode === 'navigate' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css')
  ) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (!response || response.status !== 200) return response;
          // Save a copy in cache
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails (e.g. offline)
          return caches.match(event.request);
        })
    );
  } else {
    // For images, fonts and other assets, use Cache-First, fallback to Network
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request).then(netResponse => {
            if (!netResponse || netResponse.status !== 200) return netResponse;
            const clonedResponse = netResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clonedResponse);
            });
            return netResponse;
          });
        })
    );
  }
});
