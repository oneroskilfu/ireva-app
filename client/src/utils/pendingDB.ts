/**
 * Utility functions for handling offline form submissions
 * This simpler approach can be used directly without hooks if preferred
 */

// Save data to pending database for later submission
export async function saveToPendingDB(storeName: string, data: any): Promise<string> {
  // Generate an ID if not present
  const id = data.id || new Date().toISOString();
  const dataToStore = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.add(dataToStore);
    
    request.onsuccess = () => {
      resolve(id);
      
      // Register for background sync if available
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready
          .then(registration => {
            // TypeScript doesn't know about SyncManager yet
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

// Get all pending data for a store
export async function getPendingFromDB(storeName: string): Promise<any[]> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e: Event) => reject((e.target as IDBRequest).error);
  });
}

// Remove an item from pending DB after successful submission
export async function removePendingFromDB(storeName: string, id: string): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = (e: Event) => reject((e.target as IDBRequest).error);
  });
}

// Get count of pending items for a store
export async function getPendingCount(storeName: string): Promise<number> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.count();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e: Event) => reject((e.target as IDBRequest).error);
  });
}

// Open the IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ireva-db', 1);
    
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores for various form types if they don't exist
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

// Check if browser is online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Simple submit function that will handle online/offline automatically
export async function submitWithOfflineSupport(
  data: any, 
  apiEndpoint: string, 
  storeName: string
): Promise<{success: boolean, offline: boolean, data?: any, error?: any}> {
  if (!isOnline()) {
    try {
      const id = await saveToPendingDB(storeName, data);
      return { 
        success: true, 
        offline: true,
        data: { id, message: 'Saved for offline submission' }
      };
    } catch (error) {
      return { 
        success: false, 
        offline: true,
        error 
      };
    }
  } else {
    try {
      // Online submission
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const result = await response.json();
      return { 
        success: true, 
        offline: false,
        data: result
      };
    } catch (error) {
      // If the error is likely due to network issues, try saving offline
      if (!isOnline()) {
        const id = await saveToPendingDB(storeName, data);
        return { 
          success: true, 
          offline: true,
          data: { id, message: 'Connection lost. Saved for offline submission' }
        };
      }
      
      return { 
        success: false, 
        offline: false,
        error 
      };
    }
  }
}