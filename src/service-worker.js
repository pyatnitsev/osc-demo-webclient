self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Просто проксируем онлайн-запросы, или можно сделать кэширование
    event.respondWith(fetch(event.request));
});