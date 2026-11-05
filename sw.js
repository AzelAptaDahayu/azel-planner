// Offline support: keeps the app itself on the device so it opens without internet.
// Your planner data is kept offline separately by Firebase.
const VERSION = "azel-planner-v1";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./qrcode.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.hostname === "firestore.googleapis.com") return; // live sync traffic

  // The page itself: try the network first so updates arrive, fall back to the saved copy.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put("./index.html", copy)); return res; })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  const cacheable = url.origin === self.location.origin ||
    url.hostname === "www.gstatic.com" || url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (!cacheable) return;

  // Everything else: use the saved copy right away and refresh it in the background.
  event.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req).then(res => {
        if (res && (res.ok || res.type === "opaque")) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
