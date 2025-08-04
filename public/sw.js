const CACHE_NAME = "la-economica-pos-v1.0.0";
const API_CACHE_NAME = "la-economica-api-v1.0.0";

// Static assets to cache
const STATIC_ASSETS = [
  "/",
  "/pos",
  "/inventory",
  "/reports",
  "/clients",
  "/employees",
  "/system-config",
  "/manifest.json",
  // Add more critical routes and assets here
];

// API endpoints to cache for offline functionality
const API_ENDPOINTS = [
  "/api/products",
  "/api/categories",
  "/api/clients",
  "/api/employees",
  "/api/sales/recent",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");

  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(CACHE_NAME).then((cache) => {
        console.log("Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache API endpoints
      caches.open(API_CACHE_NAME).then((cache) => {
        console.log("Pre-caching API endpoints");
        return Promise.allSettled(
          API_ENDPOINTS.map(
            (endpoint) =>
              fetch(endpoint)
                .then((response) =>
                  response.ok ? cache.put(endpoint, response) : null,
                )
                .catch(() => null), // Ignore errors during pre-caching
          ),
        );
      }),
    ]).then(() => {
      // Force activation of new service worker
      self.skipWaiting();
    }),
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

// Fetch event - handle requests with caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and external requests
  if (request.method !== "GET" || !url.origin.includes(self.location.origin)) {
    return;
  }

  // API requests - Network First with fallback to cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstStrategy(request, API_CACHE_NAME));
    return;
  }

  // Static assets - Cache First
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request, CACHE_NAME));
    return;
  }

  // Pages - Network First with cache fallback
  event.respondWith(networkFirstStrategy(request, CACHE_NAME));
});

// Cache First Strategy - for static assets
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error("Cache first strategy failed:", error);
    // Return a fallback response for critical assets
    return createFallbackResponse(request);
  }
}

// Network First Strategy - for dynamic content and API
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Update cache with fresh data
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("Network failed, falling back to cache:", request.url);

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline fallback
    return createOfflineFallback(request);
  }
}

// Check if request is for a static asset
function isStaticAsset(pathname) {
  const staticExtensions = [
    ".js",
    ".css",
    ".png",
    ".jpg",
    ".jpeg",
    ".svg",
    ".ico",
    ".woff",
    ".woff2",
  ];
  return staticExtensions.some((ext) => pathname.endsWith(ext));
}

// Create fallback response for failed requests
function createFallbackResponse(request) {
  const url = new URL(request.url);

  if (url.pathname.startsWith("/api/")) {
    // Return offline indicator for API calls
    return new Response(
      JSON.stringify({
        error: "Offline",
        message: "Esta función requiere conexión a internet",
        offline: true,
      }),
      {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // Return basic HTML for page requests
  return new Response(
    `<!DOCTYPE html>
    <html>
    <head>
      <title>La Económica POS - Offline</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
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
        }
        .container { 
          text-align: center; 
          max-width: 400px; 
          padding: 2rem;
        }
        .icon { 
          font-size: 4rem; 
          margin-bottom: 1rem; 
        }
        h1 { 
          color: #1f2937; 
          margin-bottom: 0.5rem; 
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
        }
        button:hover {
          background: #15803d;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">📱</div>
        <h1>Funcionando sin conexión</h1>
        <p>La aplicación está disponible en modo offline. Algunas funciones pueden estar limitadas.</p>
        <button onclick="window.location.reload()">Reintentar</button>
      </div>
    </body>
    </html>`,
    {
      status: 200,
      headers: { "Content-Type": "text/html" },
    },
  );
}

// Create offline fallback for API requests
function createOfflineFallback(request) {
  const url = new URL(request.url);

  if (url.pathname.startsWith("/api/")) {
    return new Response(
      JSON.stringify({
        error: "Network unavailable",
        message: "Please check your internet connection",
        offline: true,
        cached: false,
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return createFallbackResponse(request);
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("Background sync triggered:", event.tag);

  if (event.tag === "sync-sales") {
    event.waitUntil(syncOfflineSales());
  }

  if (event.tag === "sync-inventory") {
    event.waitUntil(syncInventoryUpdates());
  }
});

// Sync offline sales when connection is restored
async function syncOfflineSales() {
  try {
    const offlineSales = await getOfflineData("sales");

    for (const sale of offlineSales) {
      try {
        const response = await fetch("/api/sales", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sale),
        });

        if (response.ok) {
          await removeOfflineData("sales", sale.id);
          console.log("Offline sale synced:", sale.id);
        }
      } catch (error) {
        console.error("Failed to sync sale:", sale.id, error);
      }
    }
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}

// Sync inventory updates
async function syncInventoryUpdates() {
  try {
    const inventoryUpdates = await getOfflineData("inventory");

    for (const update of inventoryUpdates) {
      try {
        const response = await fetch(`/api/products/${update.productId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(update.data),
        });

        if (response.ok) {
          await removeOfflineData("inventory", update.id);
          console.log("Inventory update synced:", update.id);
        }
      } catch (error) {
        console.error("Failed to sync inventory update:", update.id, error);
      }
    }
  } catch (error) {
    console.error("Inventory sync failed:", error);
  }
}

// Helper functions for offline data management
async function getOfflineData(type) {
  const cache = await caches.open(`${type}-offline`);
  const requests = await cache.keys();
  const data = [];

  for (const request of requests) {
    const response = await cache.match(request);
    if (response) {
      const item = await response.json();
      data.push(item);
    }
  }

  return data;
}

async function removeOfflineData(type, id) {
  const cache = await caches.open(`${type}-offline`);
  await cache.delete(`/${type}/${id}`);
}

// Push notification handling
self.addEventListener("push", (event) => {
  console.log("Push notification received:", event);

  const options = {
    body: "Nueva notificación de La Económica POS",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    tag: "la-economica-notification",
    requireInteraction: false,
    actions: [
      {
        action: "view",
        title: "Ver",
        icon: "/icons/view-action.png",
      },
      {
        action: "dismiss",
        title: "Descartar",
        icon: "/icons/dismiss-action.png",
      },
    ],
  };

  if (event.data) {
    try {
      const data = event.data.json();
      options.body = data.message || options.body;
      options.tag = data.tag || options.tag;
      options.data = data;
    } catch (error) {
      console.error("Error parsing push data:", error);
    }
  }

  event.waitUntil(
    self.registration.showNotification("La Económica POS", options),
  );
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);

  event.notification.close();

  if (event.action === "view") {
    // Open the app
    event.waitUntil(clients.openWindow("/"));
  } else if (event.action === "dismiss") {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(clients.openWindow("/"));
  }
});

// Handle message events from the main thread
self.addEventListener("message", (event) => {
  console.log("Service Worker received message:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CACHE_URLS") {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      }),
    );
  }
});
