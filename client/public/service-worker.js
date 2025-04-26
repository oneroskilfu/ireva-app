// Service Worker for iREVA PWA
const CACHE_NAME = 'ireva-cache-v1';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/maskable_icon.png'
];

// Install event handler - caches assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  // Ensure installation is not complete until cache is populated
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell and content');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: All required resources have been cached');
        // Force new service worker to activate immediately
        return self.skipWaiting();
      })
  );
});

// Activation event handler - cleans up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  // Remove old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Now ready to handle fetches!');
      // Claim clients to ensure they use this service worker immediately
      return self.clients.claim();
    })
  );
});

// Fetch event handler - serves from cache first, then network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // For HTML pages, use network-first strategy
  if (event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // For other resources, use cache-first strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if available
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Otherwise fetch from network
      return fetch(event.request)
        .then((response) => {
          // Don't cache non-success responses or non-GET requests
          if (!response.ok || event.request.method !== 'GET') {
            return response;
          }
          
          // Clone the response to cache it and return original
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        });
    })
  );
});

// Background sync for offline transactions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/logo192.png',
    badge: '/maskable_icon.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Mock function for syncing transactions
async function syncTransactions() {
  const offlineTransactions = await getOfflineTransactions();
  
  for (const transaction of offlineTransactions) {
    try {
      await sendTransactionToServer(transaction);
      await removeTransactionFromOfflineQueue(transaction.id);
    } catch (error) {
      console.error('Failed to sync transaction:', error);
      // Will retry on next sync event
      return Promise.reject(error);
    }
  }
  
  return Promise.resolve();
}

// Mock function to get offline transactions from IndexedDB
async function getOfflineTransactions() {
  // In a real implementation, this would access IndexedDB
  return [];
}

// Mock function to send transaction to server
async function sendTransactionToServer(transaction) {
  // In a real implementation, this would make an API call
  return Promise.resolve();
}

// Mock function to remove transaction from queue after successful sync
async function removeTransactionFromOfflineQueue(id) {
  // In a real implementation, this would access IndexedDB
  return Promise.resolve();
}