// Utility functions for offline storage using IndexedDB

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ireva-db', 1);
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('investments')) {
        db.createObjectStore('investments', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('kyc')) {
        db.createObjectStore('kyc', { keyPath: 'id' });
      }
    };
    request.onsuccess = (event: Event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };
    request.onerror = (event: Event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

export async function readPendingFromDB(storeName: string): Promise<any[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e: Event) => {
      reject((e.target as IDBRequest).error);
    };
  });
}

export async function removePendingFromDB(storeName: string, id: string|number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = (e: Event) => {
      reject((e.target as IDBRequest).error);
    };
  });
}

// Save data to IndexedDB for later synchronization
export async function saveForLater(storeName: string, data: any): Promise<IDBValidKey> {
  const db = await openDB();
  
  // Generate a unique ID if not present
  if (!data.id) {
    data.id = Date.now().toString(); // Simple unique ID based on timestamp
  }
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.add(data);
    
    request.onsuccess = () => {
      resolve(request.result);
      
      // Register for background sync if available
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready
          .then(registration => {
            // TypeScript doesn't know about the SyncManager yet
            // @ts-ignore
            registration.sync.register(`sync-${storeName}`).catch((err: Error) => {
              console.error('Background sync registration failed:', err);
            });
          });
      }
    };
    
    request.onerror = (e: Event) => {
      reject((e.target as IDBRequest).error);
    };
  });
}

// Check if we're online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Try to upload data immediately if online, otherwise save for later
export async function saveOrUpload(
  storeName: string, 
  data: any, 
  apiEndpoint: string
) {
  if (isOnline()) {
    try {
      // Try to upload immediately
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.warn('Failed to upload, saving offline instead:', error);
      return await saveForLater(storeName, data);
    }
  } else {
    // Save for later sync
    return await saveForLater(storeName, data);
  }
}