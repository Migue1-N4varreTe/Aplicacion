const CACHE_NAME = "la-economica-pos-v1.1.0";
const API_CACHE_NAME = "la-economica-api-v1.1.0";

// Static assets to cache
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  // Critical routes for mobile
  "/shop",
  "/categories",
  "/cart",
  "/favorites",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching static assets");
      // Handle cache failures gracefully on mobile
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.warn("Some assets failed to cache, continuing anyway:", error);
        return Promise.resolve();
      });
    }).then(() => {
      // Force activation of new service worker
      self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      }),
      // Take control of all pages
      self.clients.claim(),
    ]),
  );
});

// Simplified fetch handler for mobile compatibility
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and external requests
  if (request.method !== "GET") {
    return;
  }

  // Skip cross-origin requests that might fail on mobile
  if (url.origin !== self.location.origin) {
    return;
  }

  // For API requests, try network first, then cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(API_CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline response for API
            return new Response(
              JSON.stringify({
                error: "Offline",
                message: "Sin conexión a internet",
                offline: true,
              }),
              {
                status: 503,
                headers: { "Content-Type": "application/json" },
              }
            );
          });
        })
    );
    return;
  }

  // For all other requests, network first with cache fallback
  event.respondWith(
    fetch(request)
      .then(response => {
        // Cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Return a simple offline page for navigation requests
          if (request.mode === 'navigate') {
            return new Response(
              `<!DOCTYPE html>
              <html lang="es">
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>La Económica - Sin conexión</title>
                <style>
                  body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    height: 100vh; 
                    margin: 0; 
                    background: #f9fafb;
                    color: #374151;
                    padding: 1rem;
                    box-sizing: border-box;
                  }
                  .container { 
                    text-align: center; 
                    max-width: 400px; 
                    width: 100%;
                  }
                  .icon { 
                    font-size: 3rem; 
                    margin-bottom: 1rem; 
                  }
                  h1 { 
                    color: #1f2937; 
                    margin-bottom: 0.5rem;
                    font-size: 1.5rem;
                  }
                  p { 
                    color: #6b7280; 
                    margin-bottom: 1.5rem; 
                  }
                  button {
                    background: #16a34a;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    font-size: 1rem;
                    width: 100%;
                    max-width: 200px;
                  }
                  button:hover {
                    background: #15803d;
                  }
                  @media (max-width: 480px) {
                    .icon { font-size: 2.5rem; }
                    h1 { font-size: 1.25rem; }
                    p { font-size: 0.9rem; }
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="icon">📱</div>
                  <h1>Sin conexión</h1>
                  <p>Verifica tu conexión a internet e intenta nuevamente.</p>
                  <button onclick="window.location.reload()">Reintentar</button>
                </div>
              </body>
              </html>`,
              {
                status: 200,
                headers: { "Content-Type": "text/html" },
              }
            );
          }
          
          // For other requests, return a generic error
          return new Response("Offline", { status: 503 });
        });
      })
  );
});

// Handle message events from the main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Simplified error handling
self.addEventListener("error", (event) => {
  console.error("Service Worker error:", event.error);
});

self.addEventListener("unhandledrejection", (event) => {
  console.error("Service Worker unhandled rejection:", event.reason);
});
