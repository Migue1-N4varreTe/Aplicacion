import { logger } from './logger';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items
  persistent?: boolean; // Store in localStorage
  keyPrefix?: string;
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private maxSize = 100;
  private keyPrefix = 'la_economica_cache_';
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start cleanup interval
    this.startCleanup();
    
    // Load persistent cache on initialization
    this.loadPersistentCache();
  }

  // Set cache item
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const {
      ttl = this.defaultTTL,
      maxSize = this.maxSize,
      persistent = false,
      keyPrefix = this.keyPrefix
    } = options;

    // Check cache size and cleanup if needed
    if (this.cache.size >= maxSize) {
      this.cleanup(true);
    }

    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key: keyPrefix + key,
    };

    this.cache.set(key, cacheItem);

    // Store in localStorage if persistent
    if (persistent) {
      try {
        localStorage.setItem(cacheItem.key, JSON.stringify(cacheItem));
      } catch (error) {
        logger.warn('Failed to store cache item in localStorage', { key, error });
      }
    }

    logger.debug('Cache item set', { key, ttl, persistent });
  }

  // Get cache item
  get<T>(key: string, options: CacheOptions = {}): T | null {
    const { keyPrefix = this.keyPrefix } = options;
    
    let cacheItem = this.cache.get(key);

    // If not in memory, try to load from localStorage
    if (!cacheItem && options.persistent !== false) {
      cacheItem = this.loadFromPersistentStorage(keyPrefix + key);
      if (cacheItem) {
        this.cache.set(key, cacheItem);
      }
    }

    if (!cacheItem) {
      logger.debug('Cache miss', { key });
      return null;
    }

    // Check if expired
    if (this.isExpired(cacheItem)) {
      this.delete(key, options);
      logger.debug('Cache item expired', { key });
      return null;
    }

    logger.debug('Cache hit', { key });
    return cacheItem.data;
  }

  // Delete cache item
  delete(key: string, options: CacheOptions = {}): boolean {
    const { keyPrefix = this.keyPrefix } = options;
    
    const removed = this.cache.delete(key);
    
    // Remove from localStorage if persistent
    try {
      localStorage.removeItem(keyPrefix + key);
    } catch (error) {
      logger.warn('Failed to remove cache item from localStorage', { key, error });
    }

    logger.debug('Cache item deleted', { key, removed });
    return removed;
  }

  // Clear all cache
  clear(options: CacheOptions = {}): void {
    const { keyPrefix = this.keyPrefix } = options;
    
    this.cache.clear();

    // Clear localStorage items with prefix
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(keyPrefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      logger.warn('Failed to clear cache from localStorage', { error });
    }

    logger.debug('Cache cleared');
  }

  // Check if cache item exists and is valid
  has(key: string, options: CacheOptions = {}): boolean {
    return this.get(key, options) !== null;
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let expired = 0;
    let valid = 0;

    this.cache.forEach((item) => {
      if (this.isExpired(item)) {
        expired++;
      } else {
        valid++;
      }
    });

    return {
      total: this.cache.size,
      valid,
      expired,
      hitRatio: this.getHitRatio(),
      memoryUsage: this.getMemoryUsage(),
    };
  }

  // Cleanup expired items
  private cleanup(force: boolean = false): void {
    const now = Date.now();
    const itemsToDelete: string[] = [];

    this.cache.forEach((item, key) => {
      if (this.isExpired(item) || force) {
        itemsToDelete.push(key);
      }
    });

    // If force cleanup and still too many items, remove oldest
    if (force && this.cache.size - itemsToDelete.length >= this.maxSize) {
      const sortedItems = Array.from(this.cache.entries())
        .filter(([key]) => !itemsToDelete.includes(key))
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);

      const toRemove = sortedItems.slice(0, Math.ceil(this.maxSize * 0.2)); // Remove 20%
      toRemove.forEach(([key]) => itemsToDelete.push(key));
    }

    itemsToDelete.forEach(key => {
      this.cache.delete(key);
    });

    if (itemsToDelete.length > 0) {
      logger.debug('Cache cleanup completed', { 
        removed: itemsToDelete.length,
        remaining: this.cache.size 
      });
    }
  }

  // Check if cache item is expired
  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  // Start automatic cleanup
  private startCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  // Load persistent cache from localStorage
  private loadPersistentCache(): void {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.keyPrefix)) {
          const cacheItem = this.loadFromPersistentStorage(key);
          if (cacheItem && !this.isExpired(cacheItem)) {
            const cacheKey = key.replace(this.keyPrefix, '');
            this.cache.set(cacheKey, cacheItem);
          } else if (cacheItem) {
            // Remove expired item
            localStorage.removeItem(key);
          }
        }
      }
      logger.debug('Persistent cache loaded', { items: this.cache.size });
    } catch (error) {
      logger.warn('Failed to load persistent cache', { error });
    }
  }

  // Load single item from localStorage
  private loadFromPersistentStorage(key: string): CacheItem<any> | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item);
    } catch (error) {
      logger.warn('Failed to parse cache item from localStorage', { key, error });
      // Remove corrupted item
      try {
        localStorage.removeItem(key);
      } catch {}
      return null;
    }
  }

  // Calculate hit ratio (dummy implementation - would need actual tracking)
  private getHitRatio(): number {
    // This would require tracking hits and misses
    return 0.85; // Placeholder
  }

  // Calculate memory usage estimate
  private getMemoryUsage(): number {
    let size = 0;
    this.cache.forEach((item) => {
      size += JSON.stringify(item).length;
    });
    return size;
  }

  // Destroy cache manager
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }
}

// Create singleton instance
export const cacheManager = new CacheManager();

// Specialized cache for different data types
export const productCache = {
  set: (id: string, data: any) => cacheManager.set(`product_${id}`, data, { ttl: 10 * 60 * 1000, persistent: true }),
  get: (id: string) => cacheManager.get(`product_${id}`, { persistent: true }),
  delete: (id: string) => cacheManager.delete(`product_${id}`, { persistent: true }),
};

export const searchCache = {
  set: (query: string, data: any) => cacheManager.set(`search_${query}`, data, { ttl: 5 * 60 * 1000 }),
  get: (query: string) => cacheManager.get(`search_${query}`),
  delete: (query: string) => cacheManager.delete(`search_${query}`),
};

export const userCache = {
  set: (userId: string, data: any) => cacheManager.set(`user_${userId}`, data, { ttl: 15 * 60 * 1000, persistent: true }),
  get: (userId: string) => cacheManager.get(`user_${userId}`, { persistent: true }),
  delete: (userId: string) => cacheManager.delete(`user_${userId}`, { persistent: true }),
};

export const apiCache = {
  set: (endpoint: string, data: any, ttl?: number) => cacheManager.set(`api_${endpoint}`, data, { ttl }),
  get: (endpoint: string) => cacheManager.get(`api_${endpoint}`),
  delete: (endpoint: string) => cacheManager.delete(`api_${endpoint}`),
};

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    cacheManager.destroy();
  });
}
