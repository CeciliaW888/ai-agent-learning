const CACHE_VERSION = 'ai-agent-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png',
  './offline.html'
];

const FONT_ORIGINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com'
];

// Install: cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: strategy based on request type
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // External resources (YouTube, etc.) — network-first
  if (url.origin !== location.origin && !FONT_ORIGINS.some(o => url.href.startsWith(o))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Google Fonts — cache-first (they're versioned/immutable)
  if (FONT_ORIGINS.some(o => url.href.startsWith(o))) {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
    return;
  }

  // Local static assets — cache-first with network update
  event.respondWith(staleWhileRevalidate(request));
});

// Cache-first: return cached, fall back to network
async function cacheFirst(request, cacheName = STATIC_CACHE) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return offlineFallback();
  }
}

// Network-first: try network, fall back to cache
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || offlineFallback();
  }
}

// Stale-while-revalidate: return cached immediately, update in background
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request)
    .then(response => {
      if (response.ok) {
        caches.open(STATIC_CACHE).then(cache => {
          cache.put(request, response.clone());
        });
      }
      return response;
    })
    .catch(() => null);

  return cached || (await fetchPromise) || offlineFallback();
}

// Offline fallback page
async function offlineFallback() {
  const cached = await caches.match('./offline.html');
  return cached || new Response(
    '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title><style>body{font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f5f0eb;color:#2c2c2c;text-align:center;padding:2rem}h1{color:#c4825a;font-size:2rem}p{color:#666;max-width:400px}</style></head><body><div><h1>🤖 Offline</h1><p>You\'re offline right now. The AI Agent Learning course will be available when you reconnect.</p><p style="margin-top:2rem"><button onclick="location.reload()" style="background:#c4825a;color:white;border:none;padding:12px 24px;border-radius:8px;font-size:1rem;cursor:pointer">Try Again</button></p></div></body></html>',
    { headers: { 'Content-Type': 'text/html' } }
  );
}
