const CACHE_NAME = 'asistencias-logic-v3';
const CORE = [
  './', './index.html', './assets/css/app.css', './assets/js/app.js',
  './assets/js/demo-data.js', './storage-simple.js', './manifest.json',
  './assets/js/modules/legacy-logic.js', './assets/js/modules/dates.js',
  './assets/js/modules/domain.js', './assets/js/modules/data-model.js',
  './assets/icon-192.png', './assets/icon-512.png', './assets/icon-maskable-512.png'
];
const EXTERNAL = [
  'https://cdn.tailwindcss.com/',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE);
    await Promise.all(EXTERNAL.map(async url => {
      try { const response = await fetch(url, { mode: 'no-cors' }); await cache.put(url, response); }
      catch { /* Optional libraries are cached after a successful online request. */ }
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key =>
    (key.startsWith('asistencias-') || key.startsWith('attendance-tracker-')) && key !== CACHE_NAME
  ).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const local = url.origin === self.location.origin && url.href.startsWith(self.registration.scope);
  const external = EXTERNAL.includes(url.href) || ['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname);
  if (!local && !external) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    if (event.request.mode === 'navigate') {
      try { return await fetch(event.request); }
      catch { return await cache.match('./index.html'); }
    }
    const cached = await cache.match(event.request);
    if (cached) return cached;
    const response = await fetch(event.request);
    if (response.ok || response.type === 'opaque') await cache.put(event.request, response.clone());
    return response;
  })());
});
