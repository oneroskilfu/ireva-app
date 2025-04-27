import { useState, useEffect } from 'react';

interface QueueStatus {
  isProcessing: boolean;
  queuedItems: number;
}

export function useOfflineQueue(storeName: string, syncTag: string) {
  const [status, setStatus] = useState<QueueStatus>({
    isProcessing: false,
    queuedItems: 0,
  });

  // Check queue status on component mount
  useEffect(() => {
    checkQueueStatus();
  }, []);

  // Check how many items are in the offline queue
  const checkQueueStatus = async () => {
    try {
      const db = await openDB();
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const countRequest = store.count();
      
      countRequest.onsuccess = () => {
        setStatus({
          isProcessing: countRequest.result > 0,
          queuedItems: countRequest.result,
        });
      };
    } catch (error) {
      console.error('Error checking queue status:', error);
    }
  };

  // Save data to IndexedDB for offline processing
  const saveOffline = async (data: any): Promise<string> => {
    try {
      const id = new Date().toISOString();
      const db = await openDB();
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      
      // Add timestamp and ID if not present
      const itemToStore = { 
        ...data, 
        id, 
        createdAt: new Date().toISOString(),
        status: 'pending' 
      };
      
      const request = store.put(itemToStore);
      
      // Wait for transaction to complete
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      
      // Register for background sync if available
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        // TypeScript doesn't know about the SyncManager yet
        // @ts-ignore
        await registration.sync.register(syncTag);
      }
      
      // Update queue status
      await checkQueueStatus();
      
      return id;
    } catch (error) {
      console.error('Error saving offline data:', error);
      throw error;
    }
  };

  // Process any pending items immediately (if we come back online)
  const processPendingItems = async (): Promise<boolean> => {
    try {
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        // TypeScript doesn't know about the SyncManager yet
        // @ts-ignore
        await registration.sync.register(syncTag);
        await checkQueueStatus();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error processing pending items:', error);
      return false;
    }
  };

  return { 
    saveOffline, 
    processPendingItems,
    status
  };
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ireva-db', 1);
    
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
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

// Helper function to check if browser is online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Usage examples:
/**
 * Example for investments:
 * 
 * import { useOfflineQueue, isOnline } from '@/hooks/use-offline-queue';
 * 
 * function InvestmentForm() {
 *   const { saveOffline, status } = useOfflineQueue('investments', 'sync-investments');
 *   
 *   const handleSubmit = async (data) => {
 *     if (!isOnline()) {
 *       try {
 *         await saveOffline(data);
 *         // Show success message for offline submission
 *       } catch (error) {
 *         // Handle error
 *       }
 *     } else {
 *       // Regular online submission
 *       try {
 *         await fetch('/api/investments', {
 *           method: 'POST',
 *           headers: { 'Content-Type': 'application/json' },
 *           body: JSON.stringify(data)
 *         });
 *       } catch (error) {
 *         // If online submission fails, try offline
 *         if (!isOnline()) {
 *           await saveOffline(data);
 *         }
 *       }
 *     }
 *   };
 *   
 *   return (
 *     <div>
 *       {status.queuedItems > 0 && (
 *         <div className="offline-banner">
 *           You have {status.queuedItems} pending submissions that will be sent when you're back online.
 *         </div>
 *       )}
 *       
 *       // Form components here
 *     </div>
 *   );
 * }
 * 
 * Example for KYC:
 * 
 * function KYCForm() {
 *   const { saveOffline, status } = useOfflineQueue('kyc', 'sync-kyc');
 *   
 *   const handleSubmit = async (kycData) => {
 *     if (!isOnline()) {
 *       await saveOffline(kycData);
 *       // Show offline submission success message
 *     } else {
 *       // Normal online API call
 *       await submitKYCData(kycData);
 *     }
 *   };
 * }
 */