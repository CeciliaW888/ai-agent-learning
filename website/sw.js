const CACHE_VERSION = 'ai-agent-v3';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './main.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './offline.html',
  // Modules
  './modules/01-what-is-an-ai-agent.html',
  './modules/02-pda-loop.html',
  './modules/03-agent-vs-chatbot-vs-rag.html',
  './modules/04-tools-and-function-calling.html',
  './modules/05-memory-and-context.html',
  './modules/06-explore-existing-agents.html',
  './modules/07-week-1-review.html',
  './modules/08-langchain-fundamentals.html',
  './modules/09-prompt-engineering-for-agents.html',
  './modules/10-tool-calling-deep-dive.html',
  './modules/11-build-research-agent-start.html',
  './modules/12-add-memory-to-agent.html',
  './modules/13-testing-and-debugging.html',
  './modules/14-week-2-review.html',
  './modules/15-multi-agent-architectures.html',
  './modules/16-agent-communication-patterns.html',
  './modules/17-production-patterns-and-safety.html',
  './modules/18-capstone-start.html',
  './modules/19-capstone-build-and-integrate.html',
  './modules/20-capstone-polish-and-deploy.html',
  './modules/21-course-review.html',
  // Data
  './data/flashcards.json',
  './data/quiz-01.json',
  './data/quiz-02.json',
  './data/quiz-03.json',
  './data/quiz-04.json',
  './data/quiz-05.json',
  './data/quiz-06.json',
  './data/quiz-07.json',
  './data/quiz-08.json',
  './data/quiz-09.json',
  './data/quiz-10.json',
  './data/quiz-11.json',
  './data/quiz-12.json',
  './data/quiz-13.json',
  './data/quiz-14.json',
  './data/quiz-15.json',
  './data/quiz-16.json',
  './data/quiz-17.json',
  './data/quiz-18.json',
  './data/quiz-19.json',
  './data/quiz-20.json',
  './data/quiz-21.json',
  // Diagrams
  './diagrams/01-pda-loop.svg',
  './diagrams/02-agent-vs-chatbot-vs-rag.svg',
  './diagrams/03-tool-calling.svg',
  './diagrams/04-multi-agent.svg',
  './diagrams/05-weekly-concept-map.svg'
];

const FONT_ORIGINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com'
];

const STATIC_EXTENSIONS = /\.(css|js|png|svg|ico|webmanifest)$/;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

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

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  const isFont = FONT_ORIGINS.some(o => url.href.startsWith(o));
  if (isFont) {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
    return;
  }

  // Let the browser handle external origins directly
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, true));
    return;
  }

  if (STATIC_EXTENSIONS.test(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (url.pathname.includes('/modules/')) {
    event.respondWith(networkFirst(request, false));
    return;
  }

  if (url.pathname.includes('/data/')) {
    event.respondWith(networkFirst(request, false));
    return;
  }

  event.respondWith(networkFirst(request, false));
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    if (cacheName === STATIC_CACHE) return offlineFallback();
    return new Response('', { status: 503 });
  }
}

async function networkFirst(request, allowOfflineFallback) {
  try {
    const response = await fetch(request);
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (allowOfflineFallback) return offlineFallback();
    return new Response('', { status: 503 });
  }
}

async function offlineFallback() {
  const cached = await caches.match('./offline.html');
  return cached || new Response(
    '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title><style>body{font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f5f0eb;color:#2c2c2c;text-align:center;padding:2rem}h1{color:#c4825a}p{color:#666;max-width:400px}</style></head><body><div><h1>🤖 Offline</h1><p>You\'re offline right now. The AI Agent Learning course will be available when you reconnect.</p><p style="margin-top:2rem"><button onclick="location.reload()" style="background:#c4825a;color:white;border:none;padding:12px 24px;border-radius:8px;font-size:1rem;cursor:pointer">Try Again</button></p></div></body></html>',
    { headers: { 'Content-Type': 'text/html' } }
  );
}
