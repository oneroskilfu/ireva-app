import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import SimpleApp from "./SimpleApp";

// Using simple app to bypass build errors and show StaticHome
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SimpleApp />
  </React.StrictMode>
);

// Register service worker for PWA functionality
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    // When new content is available, we can notify the user
    const waitingServiceWorker = registration.waiting;
    
    if (waitingServiceWorker) {
      waitingServiceWorker.addEventListener("statechange", (event) => {
        if ((event.target as ServiceWorker).state === "activated") {
          // Force page reload once the new service worker is activated
          window.location.reload();
        }
      });
      
      // Send skip waiting message to the service worker
      waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
    }
  },
  onSuccess: (registration) => {
    console.log('Service worker registered successfully for offline use');
  }
});
