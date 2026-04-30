// Store Dashboard — Service Worker
// Caches the app shell for offline/fast loading

const CACHE_NAME = 'store-dashboard-v1';
const APP_SHELL = [
  './index.html',
  './manifest.json'
];

// Install — cache app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache for app shell
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always network-first for GitHub data (store JSON files)
  if (url.hostname === 'raw.githubusercontent.com' ||
      url.hostname === 'script.google.com' ||
      url.hostname === 'script.googleusercontent.com') {
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache-first for app shell
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
