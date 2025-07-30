import { useState, useEffect, useMemo, useCallback } from 'react';
import { Product } from '@/lib/data';

interface VirtualizedProductsOptions {
  pageSize?: number;
  preloadPages?: number;
}

export const useVirtualizedProducts = (
  allProducts: Product[],
  options: VirtualizedProductsOptions = {}
) => {
  const { pageSize = 20, preloadPages = 1 } = options;
  
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set([0]));

  // Calcular total de páginas
  const totalPages = Math.ceil(allProducts.length / pageSize);

  // Productos visibles actuales
  const visibleProducts = useMemo(() => {
    const startIndex = 0;
    const endIndex = (currentPage + 1) * pageSize;
    return allProducts.slice(startIndex, Math.min(endIndex, allProducts.length));
  }, [allProducts, currentPage, pageSize]);

  // Cargar más productos
  const loadMoreProducts = useCallback(async () => {
    if (isLoading || currentPage >= totalPages - 1) return;

    setIsLoading(true);
    
    // Simular delay de red (en producción esto sería una llamada real a la API)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    setLoadedPages(prev => new Set([...prev, nextPage]));
    setIsLoading(false);
  }, [currentPage, totalPages, isLoading]);

  // Precargar páginas siguientes
  useEffect(() => {
    const preloadNextPages = async () => {
      for (let i = 1; i <= preloadPages; i++) {
        const pageToPreload = currentPage + i;
        if (pageToPreload < totalPages && !loadedPages.has(pageToPreload)) {
          // Precargar en background
          setTimeout(() => {
            setLoadedPages(prev => new Set([...prev, pageToPreload]));
          }, i * 200);
        }
      }
    };

    preloadNextPages();
  }, [currentPage, preloadPages, totalPages, loadedPages]);

  // Verificar si necesita cargar más cuando está cerca del final
  const shouldLoadMore = useMemo(() => {
    return currentPage < totalPages - 1;
  }, [currentPage, totalPages]);

  // Métricas de rendimiento
  const metrics = useMemo(() => ({
    totalProducts: allProducts.length,
    loadedProducts: visibleProducts.length,
    loadedPages: loadedPages.size,
    totalPages,
    currentPage,
    loadingProgress: ((currentPage + 1) / totalPages) * 100,
  }), [allProducts.length, visibleProducts.length, loadedPages.size, totalPages, currentPage]);

  return {
    visibleProducts,
    loadMoreProducts,
    isLoading,
    shouldLoadMore,
    metrics,
    hasNextPage: currentPage < totalPages - 1,
  };
};

// Hook para intersection observer (lazy loading)
export const useIntersectionObserver = (
  callback: () => void,
  options: IntersectionObserverInit = {}
) => {
  const [element, setElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          callback();
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [element, callback, options]);

  return setElement;
};
