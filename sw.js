const CACHE = "hallenplaner-v1";
const SHELL = ["./", "index.html", "manifest.webmanifest", "firebase-config.js", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
const EXTERNAL = ["cdnjs.cloudflare.com", "www.gstatic.com", "fonts.googleapis.com", "fonts.gstatic.com"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // eigene Dateien: erst Netz (damit Updates ankommen), sonst Speicher
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(ch => ch.put(req, c)); return r; }).catch(() => caches.match(req).then(m => m || caches.match("index.html"))));
  } else if (EXTERNAL.includes(url.hostname)) {
    // Bibliotheken und Schriften: erst Speicher, damit die App offline startet
    e.respondWith(caches.match(req).then(m => m || fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(ch => ch.put(req, c)); return r; })));
  }
});
