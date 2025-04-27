// Service Worker for iREVA PWA
const CACHE_NAME = "ireva-pwa-cache-v2"; // Bump this version when releasing major updates
const DYNAMIC_CACHE_NAME = "ireva-dynamic-cache-v2"; // Keep in sync with CACHE_NAME version
const OFFLINE_URL = "/offline.html";
const DB_NAME = "ireva-offline-db";
const DB_VERSION = 1;

// Function to open the IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error("Error opening DB:", event);
      reject("Error opening DB");
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores for investments and KYC forms if they don't exist
      if (!db.objectStoreNames.contains('investments')) {
        db.createObjectStore('investments', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('kyc')) {
        db.createObjectStore('kyc', { keyPath: 'id' });
      }
    };
  });
}

// Function to read pending data from IndexedDB
async function readPendingFromDB(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onerror = (event) => {
      console.error(`Error reading from ${storeName}:`, event);
      reject(`Error reading from ${storeName}`);
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
  });
}

// Function to remove pending data from IndexedDB after successful sync
async function removePendingFromDB(storeName, id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onerror = (event) => {
      console.error(`Error removing from ${storeName}:`, event);
      reject(`Error removing from ${storeName}`);
    };
    
    request.onsuccess = (event) => {
      resolve();
    };
  });
}

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

// Fetch Event with Runtime Caching
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  // For navigation requests (HTML pages)
  if (event.request.mode === "navigate") {
    event.respondWith(
      // Try network first for HTML content, fallback to offline page
      fetch(event.request)
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }
  
  // For API requests - network first with no caching
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(error => {
          console.error('API fetch failed:', error);
          return new Response(
            JSON.stringify({ error: 'Network connection lost' }), 
            { 
              status: 503,
              headers: { 'Content-Type': 'application/json' } 
            }
          );
        })
    );
    return;
  }
  
  // For static assets (CSS, JS, images) - cache first, then network
  if (
    event.request.destination === 'style' || 
    event.request.destination === 'script' ||
    event.request.destination === 'image' ||
    event.request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Not in cache, get from network
          return fetch(event.request)
            .then(networkResponse => {
              // Clone the response before using it
              const clonedResponse = networkResponse.clone();
              
              // Add to cache for next time
              caches.open(DYNAMIC_CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, clonedResponse);
                });
                
              return networkResponse;
            })
            .catch(() => {
              // If both cache and network fail for images, return a fallback
              if (event.request.destination === 'image') {
                return caches.match('/icons/placeholder-image.png');
              }
              return new Response('Resource unavailable offline', { 
                status: 503,
                headers: { 'Content-Type': 'text/plain' } 
              });
            });
        })
    );
    return;
  }
  
  // For all other requests - try cache first with network fallback
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        return cachedResponse || fetch(event.request)
          .then(networkResponse => {
            // Store in dynamic cache
            return caches.open(DYNAMIC_CACHE_NAME)
              .then(cache => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              });
          })
          .catch(error => {
            console.error('Fetch failed:', error);
            return caches.match(OFFLINE_URL);
          });
      })
  );
});

// Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-investments') {
    event.waitUntil(syncPendingInvestments());
  }
  if (event.tag === 'sync-kyc') {
    event.waitUntil(syncPendingKYC());
  }
});

async function syncPendingInvestments() {
  const pending = await readPendingFromDB('investments');
  for (const investment of pending) {
    try {
      await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(investment)
      });
      await removePendingFromDB('investments', investment.id);
    } catch (error) {
      console.error('Retry later: ', error);
    }
  }
}

async function syncPendingKYC() {
  const pending = await readPendingFromDB('kyc');
  for (const form of pending) {
    try {
      await fetch('/api/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      await removePendingFromDB('kyc', form.id);
    } catch (error) {
      console.error('Retry later: ', error);
    }
  }
}

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