/**
 * Sistema de caché inteligente optimizado para rendimiento
 * Diseñado para cargar páginas en menos de 3 segundos
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  size: number;
}

interface CacheConfig {
  maxSize: number; // Tamaño máximo en MB
  maxEntries: number;
  defaultTTL: number;
  criticalTTL: number;
}

class PerformanceCache {
  private cache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig = {
    maxSize: 50, // 50MB max
    maxEntries: 1000,
    defaultTTL: 5 * 60 * 1000, // 5 minutos
    criticalTTL: 30 * 60 * 1000, // 30 minutos para datos críticos
  };
  private currentSize = 0;

  constructor(config?: Partial<CacheConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    this.startCleanupTimer();
    this.setupMemoryManagement();
  }

  // Almacenar datos con prioridad
  set<T>(
    key: string, 
    data: T, 
    options: {
      ttl?: number;
      priority?: 'critical' | 'high' | 'medium' | 'low';
    } = {}
  ): void {
    const { ttl, priority = 'medium' } = options;
    const size = this.calculateSize(data);
    
    // Verificar límites antes de almacenar
    if (this.shouldStore(size, priority)) {
      this.makeSpace(size, priority);
      
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl || (priority === 'critical' ? this.config.criticalTTL : this.config.defaultTTL),
        priority,
        size,
      };
      
      this.cache.set(key, entry);
      this.currentSize += size;
      
      // Persistir datos críticos en localStorage
      if (priority === 'critical') {
        this.persistToStorage(key, entry);
      }
    }
  }

  // Obtener datos del caché
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      // Intentar recuperar de localStorage si es crítico
      const persisted = this.getFromStorage(key);
      if (persisted) {
        this.cache.set(key, persisted);
        return persisted.data;
      }
      return null;
    }
    
    // Verificar expiración
    if (this.isExpired(entry)) {
      this.delete(key);
      return null;
    }
    
    return entry.data;
  }

  // Precargar datos críticos
  async preload(keys: Array<{ key: string; loader: () => Promise<any>; priority?: 'critical' | 'high' | 'medium' | 'low' }>): Promise<void> {
    const loadPromises = keys.map(async ({ key, loader, priority = 'high' }) => {
      if (!this.get(key)) {
        try {
          const data = await loader();
          this.set(key, data, { priority });
        } catch (error) {
          console.warn(`Failed to preload ${key}:`, error);
        }
      }
    });
    
    await Promise.allSettled(loadPromises);
  }

  // Caché con función de respaldo
  async getOrSet<T>(
    key: string,
    loader: () => Promise<T>,
    options: {
      ttl?: number;
      priority?: 'critical' | 'high' | 'medium' | 'low';
    } = {}
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    const data = await loader();
    this.set(key, data, options);
    return data;
  }

  // Invalidar caché por patrón
  invalidatePattern(pattern: RegExp): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => pattern.test(key));
    keysToDelete.forEach(key => this.delete(key));
  }

  // Obtener estadísticas del caché
  getStats() {
    const entries = Array.from(this.cache.values());
    const byPriority = entries.reduce((acc, entry) => {
      acc[entry.priority] = (acc[entry.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalEntries: this.cache.size,
      totalSize: this.currentSize,
      maxSize: this.config.maxSize * 1024 * 1024, // Convert to bytes
      utilizationPercent: (this.currentSize / (this.config.maxSize * 1024 * 1024)) * 100,
      entriesByPriority: byPriority,
      oldestEntry: Math.min(...entries.map(e => e.timestamp)),
      newestEntry: Math.max(...entries.map(e => e.timestamp)),
    };
  }

  // Limpiar caché manualmente
  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
    localStorage.removeItem('performance_cache_critical');
  }

  private delete(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      this.cache.delete(key);
      this.currentSize -= entry.size;
    }
  }

  private calculateSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return 1000; // Fallback size
    }
  }

  private shouldStore(size: number, priority: 'critical' | 'high' | 'medium' | 'low'): boolean {
    const maxSizeBytes = this.config.maxSize * 1024 * 1024;
    
    // Siempre almacenar datos críticos si hay espacio
    if (priority === 'critical' && this.currentSize + size <= maxSizeBytes) {
      return true;
    }
    
    // Verificar límites generales
    return this.cache.size < this.config.maxEntries && 
           this.currentSize + size <= maxSizeBytes;
  }

  private makeSpace(requiredSize: number, priority: 'critical' | 'high' | 'medium' | 'low'): void {
    if (this.currentSize + requiredSize <= this.config.maxSize * 1024 * 1024) {
      return;
    }
    
    // Ordenar entradas por prioridad y edad para eliminación
    const entries = Array.from(this.cache.entries());
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    
    entries.sort(([, a], [, b]) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp; // Más viejo primero
    });
    
    // Eliminar entradas hasta tener espacio
    let spaceFreed = 0;
    for (const [key, entry] of entries) {
      if (entry.priority !== 'critical' && spaceFreed < requiredSize) {
        this.delete(key);
        spaceFreed += entry.size;
      }
    }
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private startCleanupTimer(): void {
    setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];
      
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          keysToDelete.push(key);
        }
      }
      
      keysToDelete.forEach(key => this.delete(key));
    }, 60000); // Limpiar cada minuto
  }

  private setupMemoryManagement(): void {
    // Monitorear presión de memoria
    if ('memory' in performance) {
      const checkMemory = () => {
        const memInfo = (performance as any).memory;
        const usagePercent = (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100;
        
        if (usagePercent > 80) {
          // Limpiar caché de baja prioridad cuando la memoria está alta
          this.cleanupLowPriority();
        }
      };
      
      setInterval(checkMemory, 30000); // Verificar cada 30 segundos
    }
  }

  private cleanupLowPriority(): void {
    const entries = Array.from(this.cache.entries());
    const lowPriorityEntries = entries.filter(([, entry]) => entry.priority === 'low');
    
    lowPriorityEntries.forEach(([key]) => this.delete(key));
  }

  private persistToStorage(key: string, entry: CacheEntry<any>): void {
    try {
      const criticalData = JSON.parse(localStorage.getItem('performance_cache_critical') || '{}');
      criticalData[key] = entry;
      localStorage.setItem('performance_cache_critical', JSON.stringify(criticalData));
    } catch (error) {
      console.warn('Failed to persist critical cache data:', error);
    }
  }

  private getFromStorage(key: string): CacheEntry<any> | null {
    try {
      const criticalData = JSON.parse(localStorage.getItem('performance_cache_critical') || '{}');
      const entry = criticalData[key];
      
      if (entry && !this.isExpired(entry)) {
        return entry;
      }
    } catch (error) {
      console.warn('Failed to retrieve from storage:', error);
    }
    
    return null;
  }
}

// Instancia global optimizada para rendimiento
export const performanceCache = new PerformanceCache({
  maxSize: 50, // 50MB
  maxEntries: 1000,
  defaultTTL: 5 * 60 * 1000,
  criticalTTL: 30 * 60 * 1000,
});

// Cachés especializados para diferentes tipos de datos
export const productCache = {
  set: (id: string, product: any) => performanceCache.set(`product:${id}`, product, { priority: 'high' }),
  get: (id: string) => performanceCache.get(`product:${id}`),
  preload: (productIds: string[]) => performanceCache.preload(
    productIds.map(id => ({
      key: `product:${id}`,
      loader: async () => {
        // En producción, esto sería una llamada a la API
        return { id, cached: true };
      },
      priority: 'high' as const,
    }))
  ),
};

export const imageCache = {
  set: (url: string, blob: Blob) => performanceCache.set(`image:${url}`, blob, { priority: 'medium' }),
  get: (url: string) => performanceCache.get(`image:${url}`),
};

export const searchCache = {
  set: (query: string, results: any[]) => performanceCache.set(`search:${query}`, results, { priority: 'high', ttl: 2 * 60 * 1000 }),
  get: (query: string) => performanceCache.get(`search:${query}`),
};

export const routeCache = {
  set: (route: string, data: any) => performanceCache.set(`route:${route}`, data, { priority: 'critical' }),
  get: (route: string) => performanceCache.get(`route:${route}`),
};
