// Service Worker for iREVA PWA
const CACHE_NAME = "ireva-pwa-cache-v1";
const OFFLINE_URL = "/offline.html";

const urlsToCache = [
  "/",
  "/dashboard",
  "/investments",
  "/kyc",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/logo192.png",
  "/logo512.png",
  OFFLINE_URL,
];

// Install Event
self.addEventListener("install", (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell and content');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      )
    ).then(() => {
      console.log('Service Worker: Now ready to handle fetches!');
      return self.clients.claim();
    })
  );
});

// Fetch Event
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then((response) => response || fetch(event.request))
    );
  }
});

// Listen for messages from the client and skip waiting if requested
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Skipping waiting phase and activating new version');
    self.skipWaiting();
  }
});

// Handle push notifications
self.addEventListener('push', function(event) {
  const data = event.data.json();
  console.log('Push received:', data);

  const title = data.title || "iREVA Notification";
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});