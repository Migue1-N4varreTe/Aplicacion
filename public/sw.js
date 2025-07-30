// Service Worker for La Económica PWA
// Enhanced offline functionality and caching

const CACHE_NAME = 'la-economica-v1.2.0';
const STATIC_CACHE = 'static-cache-v1.2.0';
const DYNAMIC_CACHE = 'dynamic-cache-v1.2.0';
const IMAGE_CACHE = 'images-cache-v1.2.0';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/offline.html',
  // Add other critical assets
];

// Routes that should work offline
const OFFLINE_ROUTES = [
  '/',
  '/shop',
  '/categories',
  '/cart',
  '/favorites',
  '/shopping-list',
  '/addresses',
  '/pickup',
  '/reviews',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('SW: Installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE &&
                cacheName !== IMAGE_CACHE) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external requests
  if (url.origin !== location.origin) return;

  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const url = new URL(request.url);
  
  // Handle different types of requests
  if (isStaticAsset(url.pathname)) {
    return handleStaticAsset(request);
  }
  
  if (isImage(url.pathname)) {
    return handleImage(request);
  }
  
  if (isAPIRequest(url.pathname)) {
    return handleAPIRequest(request);
  }
  
  if (isPageRequest(url.pathname)) {
    return handlePageRequest(request);
  }
  
  // Default: network first
  return handleNetworkFirst(request);
}

// Static assets - cache first
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('SW: Failed to fetch static asset:', error);
    return new Response('Asset not available offline', { 
      status: 404,
      statusText: 'Not Found'
    });
  }
}

// Images - cache first with fallback
async function handleImage(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return placeholder image for offline
    return new Response(
      '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Imagen no disponible</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// API requests - network first with offline fallback
async function handleAPIRequest(request) {
  try {
    const response = await fetch(request);
    
    // Cache successful GET requests
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Try to serve from cache
    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
      // Add offline indicator header
      const response = cached.clone();
      response.headers.set('X-Served-From', 'cache');
      return response;
    }
    
    // Return offline data
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'Esta función requiere conexión a internet',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Page requests - network first with offline page fallback
async function handlePageRequest(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache the page
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Try to serve from cache
    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Serve offline page for app routes
    const url = new URL(request.url);
    if (OFFLINE_ROUTES.includes(url.pathname)) {
      return caches.match('/offline.html');
    }
    
    return new Response('Page not available offline', {
      status: 404,
      statusText: 'Not Found'
    });
  }
}

// Network first strategy
async function handleNetworkFirst(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(request);
    return cached || new Response('Not available offline');
  }
}

// Helper functions
function isStaticAsset(pathname) {
  return pathname.startsWith('/static/') || 
         pathname.endsWith('.js') || 
         pathname.endsWith('.css') ||
         pathname.endsWith('.woff') ||
         pathname.endsWith('.woff2');
}

function isImage(pathname) {
  return pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
}

function isAPIRequest(pathname) {
  return pathname.startsWith('/api/');
}

function isPageRequest(pathname) {
  return !pathname.includes('.') || pathname.endsWith('.html');
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('SW: Performing background sync');
  
  // Sync any pending data when connection is restored
  try {
    // Here you would sync offline data with the server
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC_COMPLETE',
        data: { success: true }
      });
    });
  } catch (error) {
    console.error('SW: Background sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: 'Tienes una nueva actualización',
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icon-192x192.png'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data = data.data || options.data;
  }

  event.waitUntil(
    self.registration.showNotification('La Económica', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close, no action needed
  } else {
    // Default action
    event.waitUntil(
      clients.openWindow('/')
    );
  }

  // Send message to client
  event.waitUntil(
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'NOTIFICATION_CLICK',
          data: event.notification.data
        });
      });
    })
  );
});

// Message handling
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('SW: Service Worker loaded');
