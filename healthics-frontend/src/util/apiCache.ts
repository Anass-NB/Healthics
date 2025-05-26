/**
 * Simple in-memory cache for API responses
 */

interface CacheItem {
  data: any;
  timestamp: number;
  expiresAt: number;
}

class ApiCache {
  private cache: Map<string, CacheItem> = new Map();
  private readonly defaultTTL: number = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Get an item from cache if it exists and is not expired
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if item is expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }
  
  /**
   * Store an item in the cache with optional TTL
   */
  set(key: string, data: any, ttl: number = this.defaultTTL): void {
    const now = Date.now();
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });
  }
  
  /**
   * Remove an item from the cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Clear all cached items
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Clear expired items from the cache
   */
  clearExpired(): void {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Get the number of items in the cache
   */
  size(): number {
    return this.cache.size;
  }
}

// Export a singleton instance
export const apiCache = new ApiCache();

/**
 * Higher-order function to cache API responses
 * @param fn The API fetch function to cache
 * @param keyFn Function to generate a cache key from the arguments
 * @param ttl Time to live in milliseconds
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyFn: (...args: Parameters<T>) => string,
  ttl?: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const cacheKey = keyFn(...args);
    const cachedResult = apiCache.get<ReturnType<T>>(cacheKey);
    
    if (cachedResult !== null) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedResult;
    }
    
    console.log(`Cache miss for ${cacheKey}`);
    const result = await fn(...args);
    apiCache.set(cacheKey, result, ttl);
    
    return result;
  };
}

export default apiCache;