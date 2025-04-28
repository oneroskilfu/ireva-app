import { createRoot } from "react-dom/client";
import MinimalApp from "./MinimalApp"; // Using our minimal app instead
import "./index.css";
// Removing all providers temporarily for isolated testing
// import { AuthProvider } from "@/hooks/use-auth";
// import { QueryClientProvider } from "@tanstack/react-query";
// import { queryClient } from "./lib/queryClient";
// import { IntegratedThemeProvider } from './providers/IntegratedThemeProvider';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Simplified render with no wrappers to isolate Material UI issues
createRoot(document.getElementById("root")!).render(
  <MinimalApp />
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
