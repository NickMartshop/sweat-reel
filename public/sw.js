const CACHE_NAME = 'sweatreel-v1.0.0';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(url).catch(() => null))
      );
    })
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: network-first for API calls, cache-first for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never intercept: Supabase, Razorpay, Gemini, external APIs
  const skipDomains = [
    'supabase.co',
    'razorpay.com',
    'googleapis.com',
    'googlesyndication.com',
    'amazon.in',
    'amzn.to',
    'a.co',
  ];

  if (skipDomains.some(domain => url.hostname.includes(domain))) {
    return; // Let these pass through normally
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // For navigation (HTML pages): network-first, fallback to cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, cloned);
          });
          return response;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  // For static assets (JS, CSS, images): cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) return response;

        const cloned = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, cloned);
        });
        return response;
      }).catch(() => null);
    })
  );
});

// Push notifications handler
self.addEventListener('push', (event) => {
  const data = event.data
    ? event.data.json()
    : { title: 'SweatReel', body: "Time to train! 💪" };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      tag: 'sweatreel-notification',
      renotify: true,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
