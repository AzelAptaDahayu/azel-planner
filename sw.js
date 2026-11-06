// Offline support: keeps the app itself on the device so it opens without internet.
// Your planner data is kept offline separately by Firebase.
const VERSION = "azel-planner-v13";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./qrcode.js",
  "./pita.js",
  "./ielts.js",
  "./chesslib.js",
  "./vocab.js",
  "./learn.js",
  "./grammar.js",
  "./math.js",
  "./pitachess.js",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(VERSION)
      .then(c => c.addAll(SHELL.map(u => new Request(u, {cache: "reload"}))))
      .then(() => self.skipWaiting())
  );
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
  if (url.hostname === "firestore.googleapis.com" || url.hostname === "generativelanguage.googleapis.com") return;

  // The app's own files: always try the newest version first, use the saved copy when offline.
  if (url.origin === self.location.origin) {
    const key = req.mode === "navigate" ? "./index.html" : req;
    event.respondWith(
      fetch(req.url, {cache: "no-cache"})
        .then(res => {
          if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(key, copy)); }
          return res;
        })
        .catch(() => caches.match(key).then(hit => hit || caches.match("./index.html")))
    );
    return;
  }

  // Fonts and the Firebase library: use the saved copy right away and refresh it in the background.
  const cacheable = url.hostname === "www.gstatic.com" || url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (!cacheable) return;
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
