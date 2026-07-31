const CACHE="fundaciones-v5";
const ASSETS=["./","index.html","styles.css","app.js","manifest.webmanifest","assets/building-foundation.jpg","assets/icon-192.png","assets/icon-512.png"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener("fetch",e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
