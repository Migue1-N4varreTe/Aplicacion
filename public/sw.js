// Service Worker Optimizado para La Económica
// Objetivo: Carga de página en máximo 3 segundos

const CACHE_NAME = 'la-economica-v2-optimized';
const CRITICAL_CACHE = 'la-economica-critical-v2';
const IMAGE_CACHE = 'la-economica-images-v2';
const API_CACHE = 'la-economica-api-v2';

// Recursos críticos para cache inmediato (First Paint)
const CRITICAL_RESOURCES = [
  '/',
  '/shop',
  '/manifest.json',
  '/offline.html'
];

// Imágenes de productos populares para precargar
const POPULAR_IMAGES = [
  'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Producto+Popular+1',
  'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Producto+Popular+2',
  'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Producto+Popular+3',
  'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Producto+Popular+4',
  'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Producto+Popular+5'
];

// Install - Cache crítico y preload de imágenes
self.addEventListener('install', (event) => {
  console.log('SW: Installing v2 optimized for 3s load...');
  
  event.waitUntil(
    Promise.all([
      // Cache crítico para carga inmediata
      caches.open(CRITICAL_CACHE)
        .then(cache => {
          console.log('SW: Caching critical resources');
          return cache.addAll(CRITICAL_RESOURCES);
        }),
      
      // Precargar imágenes populares en background
      caches.open(IMAGE_CACHE)
        .then(cache => {
          console.log('SW: Preloading popular images');
          return Promise.allSettled(
            POPULAR_IMAGES.map(url => 
              fetch(url, { priority: 'low' })
                .then(response => {
                  if (response.ok) {
                    return cache.put(url, response);
                  }
                })
                .catch(() => {})
            )
          );
        })
    ]).then(() => {
      console.log('SW: Installation complete, skipping waiting');
      return self.skipWaiting();
    })
  );
});

// Activate - Limpieza de caches antiguos
self.addEventListener('activate', (event) => {
  console.log('SW: Activating v2 optimized...');
  
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (![
              CACHE_NAME, 
              CRITICAL_CACHE, 
              IMAGE_CACHE, 
              API_CACHE
            ].includes(cacheName)) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Tomar control inmediato
      self.clients.claim()
    ])
  );
});

// Fetch - Estrategias optimizadas por tipo de recurso
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Estrategias específicas por tipo de recurso
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

// Estrategia para imágenes: Cache First con preload inteligente
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  
  // Intentar desde cache primero (más rápido)
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Fetch con timeout corto para evitar bloqueos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const networkResponse = await fetch(request, {
      signal: controller.signal,
      priority: 'low'
    });
    
    clearTimeout(timeoutId);
    
    if (networkResponse.ok) {
      // Cache para futuras requests
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('SW: Image fetch failed or timed out, using fallback');
  }
  
  // Fallback a imagen placeholder
  return new Response(
    `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">Imagen no disponible</text>
    </svg>`,
    {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600'
      }
    }
  );
}

// Estrategia para API: Network First con cache corto
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    // Timeout corto para APIs (1.5s max)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    
    const networkResponse = await fetch(request, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (networkResponse.ok) {
      // Cache solo por 2 minutos para APIs
      const responseToCache = networkResponse.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-at', new Date().toISOString());
      
      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, cachedResponse);
      return networkResponse;
    }
  } catch (error) {
    console.log('SW: API request failed, checking cache');
    
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      // Verificar si el cache no es muy viejo (2 minutos)
      const cachedAt = cachedResponse.headers.get('sw-cached-at');
      if (cachedAt) {
        const cacheAge = Date.now() - new Date(cachedAt).getTime();
        if (cacheAge < 2 * 60 * 1000) { // 2 minutos
          return cachedResponse;
        }
      }
    }
  }
  
  return new Response('{"error": "API not available"}', {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Estrategia para documentos: Network First con cache crítico
async function handleDocumentRequest(request) {
  // Verificar cache crítico primero (instantáneo)
  const criticalCache = await caches.open(CRITICAL_CACHE);
  const criticalResponse = await criticalCache.match(request);
  if (criticalResponse) {
    return criticalResponse;
  }
  
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // Timeout muy corto para documentos (2s max)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const networkResponse = await fetch(request, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('SW: Document fetch failed, using cache');
    
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
  }
  
  // Fallback a página offline
  return cache.match('/offline.html') || 
    criticalCache.match('/offline.html') ||
    new Response('Offline - No connection available', { status: 503 });
}

// Estrategia para recursos estáticos: Cache First agresivo
async function handleStaticRequest(request) {
  // Cache crítico primero (más rápido)
  const criticalCache = await caches.open(CRITICAL_CACHE);
  const criticalResponse = await criticalCache.match(request);
  if (criticalResponse) {
    return criticalResponse;
  }
  
  // Cache normal
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Para recursos estáticos, timeout más largo pero con prioridad baja
    const networkResponse = await fetch(request, {
      priority: 'low'
    });
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('SW: Static resource failed:', request.url);
  }
  
  return new Response('Resource not available', { status: 404 });
}

// Background sync para requests fallidas
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(retryFailedRequests());
  }
});

async function retryFailedRequests() {
  console.log('SW: Retrying failed requests...');
  // Implementar retry de requests fallidas desde IndexedDB
}

// Push notifications optimizadas
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: data.data,
    requireInteraction: false, // No bloquear UI
    silent: false,
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Manejo de clicks en notificaciones
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

// Limpieza periódica de caches (cada hora)
setInterval(async () => {
  try {
    // Limpiar cache de imágenes antiguas (más de 1 día)
    const imageCache = await caches.open(IMAGE_CACHE);
    const requests = await imageCache.keys();
    
    for (const request of requests) {
      const response = await imageCache.match(request);
      if (response) {
        const cacheDate = response.headers.get('date');
        if (cacheDate) {
          const dayOld = Date.now() - new Date(cacheDate).getTime();
          if (dayOld > 24 * 60 * 60 * 1000) { // 1 día
            await imageCache.delete(request);
          }
        }
      }
    }
    
    // Limpiar cache de API antiguo (más de 5 minutos)
    const apiCache = await caches.open(API_CACHE);
    const apiRequests = await apiCache.keys();
    
    for (const request of apiRequests) {
      const response = await apiCache.match(request);
      if (response) {
        const cachedAt = response.headers.get('sw-cached-at');
        if (cachedAt) {
          const age = Date.now() - new Date(cachedAt).getTime();
          if (age > 5 * 60 * 1000) { // 5 minutos
            await apiCache.delete(request);
          }
        }
      }
    }
  } catch (error) {
    console.log('SW: Cache cleanup failed:', error);
  }
}, 60 * 60 * 1000); // Cada hora

console.log('SW: Optimized Service Worker loaded for 3s target');
