import { createRoot } from "react-dom/client";
import App from "./App-fixed";
import "./index.css";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Simple error handler for initial rendering errors
try {
  // Create root and render the app
  const root = createRoot(document.getElementById("root")!);
  root.render(<App />);
  
  console.log("Application mounted successfully");
  
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
} catch (error) {
  console.error("Critical error rendering application:", error);
  
  // Show a basic error message if there's a critical rendering error
  document.getElementById("root")!.innerHTML = `
    <div style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: system-ui, sans-serif; color: #cf1322; background-color: #fff1f0; border: 1px solid #ff4d4f; border-radius: 8px;">
      <h1>Failed to start application</h1>
      <p>There was a critical error starting the application. Please try refreshing the page.</p>
      <details style="margin-bottom: 1rem;">
        <summary style="cursor: pointer; font-weight: bold;">Error details</summary>
        <pre style="overflow: auto; background: #f5f5f5; padding: 1rem; border-radius: 4px;">${error?.toString()}\n${(error as Error)?.stack}</pre>
      </details>
      <button 
        onclick="window.location.reload()"
        style="padding: 0.5rem 1rem; background-color: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer;"
      >
        Reload page
      </button>
    </div>
  `;
}