import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/sentry"; // Initialize Sentry
import { logger } from "./lib/logger";

// Registrar Service Worker para optimización de rendimiento
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      logger.info('Service Worker registered successfully');

      // Manejar actualizaciones del SW
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              logger.info('New Service Worker available, reloading...');
              window.location.reload();
            }
          });
        }
      });
    } catch (error) {
      logger.error('Service Worker registration failed:', error);
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
