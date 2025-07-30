const CACHE_NAME = 'la-economica-v1';
const CRITICAL_CACHE = 'la-economica-critical-v1';
const IMAGE_CACHE = 'la-economica-images-v1';
const API_CACHE = 'la-economica-api-v1';

// Critical resources to cache immediately
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/src/index.css',
  '/src/App.css',
  '/manifest.json'
];

// Resources to cache on first visit
const RUNTIME_CACHE = [
  '/shop',
  '/categories',
  '/cart',
  '/favorites'
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('SW: Installing...');
  
  event.waitUntil(
    caches.open(CRITICAL_CACHE)
      .then(cache => {
        console.log('SW: Caching critical resources');
        return cache.addAll(CRITICAL_RESOURCES);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== CRITICAL_CACHE && 
                cacheName !== IMAGE_CACHE && 
                cacheName !== API_CACHE) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all clients
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with fallback strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Different strategies for different resource types
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
  } else if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else if (request.destination === 'document') {
    event.respondWith(handleDocumentRequest(request));
  } else {
    event.respondWith(handleStaticRequest(request));
  }
});

// Image caching strategy - Cache First with 30 day expiration
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Check if cache is still fresh (30 days)
    const cacheDate = new Date(cachedResponse.headers.get('sw-cache-date') || 0);
    const now = new Date();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    
    if (now - cacheDate < thirtyDays) {
      return cachedResponse;
    }
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Clone and add cache date header
      const responseToCache = networkResponse.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-date', new Date().toISOString());
      
      const cachedResponseWithDate = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, cachedResponseWithDate);
      return networkResponse;
    }
  } catch (error) {
    console.log('SW: Network failed for image, serving from cache:', error);
  }
  
  return cachedResponse || new Response('Image not available', { status: 404 });
}

// API caching strategy - Network First with 5 minute cache
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache successful API responses for 5 minutes
      const responseToCache = networkResponse.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-date', new Date().toISOString());
      
      const cachedResponseWithDate = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, cachedResponseWithDate);
      return networkResponse;
    }
  } catch (error) {
    console.log('SW: Network failed for API, checking cache:', error);
    
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      // Check if cache is still fresh (5 minutes)
      const cacheDate = new Date(cachedResponse.headers.get('sw-cache-date') || 0);
      const now = new Date();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (now - cacheDate < fiveMinutes) {
        return cachedResponse;
      }
    }
  }
  
  return new Response('API not available', { status: 503 });
}

// Document caching strategy - Network First with cache fallback
async function handleDocumentRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('SW: Network failed for document, serving from cache:', error);
  }
  
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Fallback to offline page
  return cache.match('/offline.html') || new Response('Offline', { status: 503 });
}

// Static resources strategy - Cache First with network fallback
async function handleStaticRequest(request) {
  // Check critical cache first
  const criticalCache = await caches.open(CRITICAL_CACHE);
  const criticalResponse = await criticalCache.match(request);
  if (criticalResponse) {
    return criticalResponse;
  }
  
  // Check main cache
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('SW: Network failed for static resource:', error);
  }
  
  return new Response('Resource not available', { status: 404 });
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(retryFailedRequests());
  }
});

async function retryFailedRequests() {
  // Retry any failed requests stored in IndexedDB
  console.log('SW: Retrying failed requests...');
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: data.data,
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    getCacheSize().then(size => {
      event.ports[0].postMessage({ size });
    });
  }
});

async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    totalSize += keys.length;
  }
  
  return totalSize;
}

// Periodic cache cleanup
setInterval(async () => {
  const imageCache = await caches.open(IMAGE_CACHE);
  const requests = await imageCache.keys();
  
  for (const request of requests) {
    const response = await imageCache.match(request);
    if (response) {
      const cacheDate = new Date(response.headers.get('sw-cache-date') || 0);
      const now = new Date();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      
      if (now - cacheDate > thirtyDays) {
        await imageCache.delete(request);
      }
    }
  }
}, 60 * 60 * 1000); // Run every hour
