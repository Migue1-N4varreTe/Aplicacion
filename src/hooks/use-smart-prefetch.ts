import { useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { performanceCache, routeCache, productCache } from '@/lib/performance-cache';
import { allProducts } from '@/lib/data';

interface PrefetchConfig {
  enabled: boolean;
  prefetchOnHover: boolean;
  prefetchOnVisible: boolean;
  prefetchDelay: number;
  maxConcurrentPrefetch: number;
}

export const useSmartPrefetch = (config: Partial<PrefetchConfig> = {}) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const defaultConfig: PrefetchConfig = {
    enabled: true,
    prefetchOnHover: true,
    prefetchOnVisible: true,
    prefetchDelay: 100,
    maxConcurrentPrefetch: 3,
  };
  
  const finalConfig = { ...defaultConfig, ...config };
  const prefetchQueue = useRef<Set<string>>(new Set());
  const activePrefetch = useRef<Set<string>>(new Set());

  // Prefetch de rutas críticas
  const prefetchCriticalRoutes = useCallback(async () => {
    if (!finalConfig.enabled) return;

    const criticalRoutes = ['/shop', '/cart', '/favorites', '/categories'];

    try {
      for (const route of criticalRoutes) {
        if (location.pathname !== route && !routeCache.get(route)) {
          await prefetchRoute(route);
        }
      }
    } catch (error) {
      console.warn('Error prefetching critical routes:', error);
    }
  }, [location.pathname, finalConfig.enabled, prefetchRoute]);

  // Prefetch de productos basado en comportamiento del usuario
  const prefetchProductData = useCallback(async () => {
    if (!finalConfig.enabled) return;

    try {
      // Prefetch productos populares
      const popularProducts = allProducts
        .sort((a, b) => b.reviewCount - a.reviewCount)
        .slice(0, 20)
        .map(p => p.id);

      await productCache.preload(popularProducts);

      // Prefetch productos de la categoría actual si estamos en shop
      if (location.pathname === '/shop') {
        const searchParams = new URLSearchParams(location.search);
        const category = searchParams.get('category');

        if (category) {
          const categoryProducts = allProducts
            .filter(p => p.category === category)
            .slice(0, 40)
            .map(p => p.id);

          await productCache.preload(categoryProducts);
        }
      }
    } catch (error) {
      console.warn('Error prefetching product data:', error);
    }
  }, [location.pathname, location.search, finalConfig.enabled]);

  // Prefetch de ruta específica
  const prefetchRoute = useCallback(async (route: string) => {
    if (activePrefetch.current.has(route) || 
        activePrefetch.current.size >= finalConfig.maxConcurrentPrefetch) {
      return;
    }
    
    activePrefetch.current.add(route);
    
    try {
      // Simular carga de datos de la ruta
      const routeData = await loadRouteData(route);
      routeCache.set(route, routeData);
      
      // Prefetch assets de la ruta
      await prefetchRouteAssets(route);
    } catch (error) {
      console.warn(`Failed to prefetch route ${route}:`, error);
    } finally {
      activePrefetch.current.delete(route);
    }
  }, [finalConfig.maxConcurrentPrefetch]);

  // Cargar datos de una ruta
  const loadRouteData = async (route: string) => {
    switch (route) {
      case '/shop':
        return {
          products: allProducts.slice(0, 20),
          categories: ['lacteos-huevos', 'carniceria-cremeria', 'frutas-verduras'],
          filters: {},
        };
      case '/cart':
        return {
          items: [],
          total: 0,
          shipping: 0,
        };
      case '/favorites':
        return {
          favorites: [],
          recommendations: allProducts.slice(0, 10),
        };
      default:
        return { preloaded: true };
    }
  };

  // Prefetch assets de una ruta
  const prefetchRouteAssets = async (route: string) => {
    const assetMap: Record<string, string[]> = {
      '/shop': [
        // Imágenes de productos populares
        ...allProducts.slice(0, 20).map(p => p.image),
      ],
      '/cart': [
        // Iconos de métodos de pago
        'https://via.placeholder.com/50x30/4285f4/FFFFFF?text=PayPal',
        'https://via.placeholder.com/50x30/000000/FFFFFF?text=Card',
      ],
      '/favorites': [
        // Imágenes de productos recomendados
        ...allProducts.slice(0, 10).map(p => p.image),
      ],
    };
    
    const assets = assetMap[route] || [];
    
    // Prefetch imágenes
    const prefetchPromises = assets.map(async (src) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = src;
      });
    });
    
    await Promise.allSettled(prefetchPromises);
  };

  // Hook para prefetch en hover
  const usePrefetchOnHover = () => {
    return useCallback((route: string) => {
      if (!finalConfig.prefetchOnHover || !finalConfig.enabled) return {};
      
      return {
        onMouseEnter: () => {
          setTimeout(() => {
            prefetchRoute(route);
          }, finalConfig.prefetchDelay);
        },
      };
    }, []);
  };

  // Hook para prefetch en intersección
  const usePrefetchOnVisible = () => {
    const observerRef = useRef<IntersectionObserver>();
    
    useEffect(() => {
      if (!finalConfig.prefetchOnVisible || !finalConfig.enabled) return;
      
      observerRef.current = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const route = entry.target.getAttribute('data-prefetch-route');
            if (route) {
              prefetchRoute(route);
            }
          }
        });
      }, {
        rootMargin: '50px',
      });
      
      return () => {
        observerRef.current?.disconnect();
      };
    }, []);
    
    return useCallback((element: HTMLElement | null, route: string) => {
      if (element && observerRef.current) {
        element.setAttribute('data-prefetch-route', route);
        observerRef.current.observe(element);
      }
    }, []);
  };

  // Prefetch inteligente basado en patrones de navegación
  const intelligentPrefetch = useCallback(() => {
    const currentPath = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    
    // Prefetch basado en la página actual
    switch (currentPath) {
      case '/':
        // Desde home, es probable que vayan a shop
        prefetchRoute('/shop');
        break;
      case '/shop':
        // Desde shop, es probable que vayan a producto específico o carrito
        prefetchRoute('/cart');
        if (searchParams.get('category')) {
          // Si hay categoría, prefetch productos relacionados
          prefetchProductData();
        }
        break;
      case '/cart':
        // Desde carrito, es probable que vayan a checkout
        prefetchRoute('/checkout');
        break;
      case '/categories':
        // Desde categorías, es probable que vayan a shop con filtro
        prefetchRoute('/shop');
        break;
    }
  }, [location, prefetchProductData]);

  // Prefetch inicial
  useEffect(() => {
    if (!finalConfig.enabled) return;
    
    // Prefetch crítico inmediato
    requestIdleCallback(() => {
      prefetchCriticalRoutes();
      prefetchProductData();
      intelligentPrefetch();
    });
  }, [location.pathname]);

  // Limpiar prefetch cuando cambia la ruta
  useEffect(() => {
    // Limpiar queue de prefetch al cambiar de página
    prefetchQueue.current.clear();
  }, [location.pathname]);

  return {
    prefetchRoute,
    usePrefetchOnHover,
    usePrefetchOnVisible,
    isEnabled: finalConfig.enabled,
    stats: {
      queueSize: prefetchQueue.current.size,
      activePrefetch: activePrefetch.current.size,
      cacheStats: performanceCache.getStats(),
    },
  };
};

// Hook para componentes que quieren prefetch automático
export const useAutoPrefetch = (route: string, trigger: 'hover' | 'visible' | 'immediate' = 'hover') => {
  const { prefetchRoute, usePrefetchOnHover, usePrefetchOnVisible } = useSmartPrefetch();
  
  const hoverProps = usePrefetchOnHover();
  const setVisibleRef = usePrefetchOnVisible();
  
  useEffect(() => {
    if (trigger === 'immediate') {
      prefetchRoute(route);
    }
  }, [route, trigger, prefetchRoute]);
  
  if (trigger === 'hover') {
    return hoverProps(route);
  }
  
  if (trigger === 'visible') {
    return { ref: (el: HTMLElement | null) => setVisibleRef(el, route) };
  }
  
  return {};
};

// Utilidad para precargar recursos críticos en app startup
export const preloadCriticalResources = async () => {
  try {
    // Precargar datos críticos
    await Promise.allSettled([
      // Productos más populares
      productCache.preload(
        allProducts
          .sort((a, b) => b.reviewCount - a.reviewCount)
          .slice(0, 10)
          .map(p => p.id)
      ),
      
      // Rutas críticas
      performanceCache.preload([
        {
          key: 'route:/shop',
          loader: async () => ({
            products: allProducts.slice(0, 20),
            categories: ['lacteos-huevos', 'carniceria-cremeria'],
          }),
          priority: 'critical',
        },
        {
          key: 'route:/cart',
          loader: async () => ({ items: [], total: 0 }),
          priority: 'high',
        },
      ]),
    ]);
  } catch (error) {
    console.warn('Failed to preload critical resources:', error);
  }
};
