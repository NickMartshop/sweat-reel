// SweatReel Service Worker v1.0.0
const CACHE_NAME = 'sweatreel-v1';

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.add('/'))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Never intercept: Supabase, Razorpay, Gemini, Amazon, AdSense
  const skipDomains = [
    'supabase.co', 'razorpay.com', 'googleapis.com',
    'googlesyndication.com', 'amazon.in', 'amzn.to',
    'a.co', 'checkout.razorpay.com', 'generativelanguage'
  ];
  if (skipDomains.some((d) => url.hostname.includes(d))) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type !== 'opaque') {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) =>
            cache.put(event.request, cloned)
          );
        }
        return response;
      });
      return cached || networkFetch;
    }).catch(() => caches.match('/'))
  );
});

self.addEventListener('push', (event) => {
  const data = event.data
    ? event.data.json()
    : { title: 'SweatReel', body: 'Time to train! 💪' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
    })
  );
});
