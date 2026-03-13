/**
 * LRU Cache
 *
 * A generic Least Recently Used (LRU) cache implementation with optional TTL support.
 * When the cache reaches its maximum size, the least recently used entry is evicted.
 */

export interface LRUCacheOptions {
  /**
   * Maximum number of entries to store in the cache.
   * When exceeded, the least recently used entry is evicted.
   * @default 100
   */
  maxSize?: number;

  /**
   * Time-to-live in milliseconds for cached entries.
   * Entries older than this will be considered stale and automatically removed.
   * @default undefined (no TTL)
   */
  ttl?: number;
}

interface CacheEntry<V> {
  value: V;
  timestamp: number;
}

/**
 * LRU Cache with configurable size limit and optional TTL.
 *
 * @example
 * ```typescript
 * // Basic usage
 * const cache = new LRUCache<string, number>({ maxSize: 50 });
 * cache.set('key1', 100);
 * const value = cache.get('key1'); // 100
 *
 * // With TTL (5 minutes)
 * const cache = new LRUCache<string, Data>({ maxSize: 100, ttl: 5 * 60 * 1000 });
 * cache.set('key', data);
 * // After 5 minutes, cache.get('key') returns undefined
 * ```
 */
export class LRUCache<K, V> {
  private maxSize: number;
  private ttl?: number;
  private cache: Map<K, CacheEntry<V>>;

  constructor(options: LRUCacheOptions = {}) {
    this.maxSize = options.maxSize ?? 100;
    this.ttl = options.ttl;
    this.cache = new Map();
  }

  /**
   * Get a value from the cache.
   * Returns undefined if the key doesn't exist or the entry has expired.
   * Moves the entry to the end (most recently used position).
   */
  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }

    // Check if expired
    if (this.ttl && Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  /**
   * Set a value in the cache.
   * If the key already exists, updates the value and moves it to the end.
   * If the cache is full, evicts the least recently used entry.
   */
  set(key: K, value: V): void {
    // If key exists, delete it first (will re-add at end)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Cache is full, evict oldest (first) entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    // Add new entry at the end (most recent)
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * Check if a key exists in the cache and is not expired.
   * Does not update the LRU order.
   */
  has(key: K): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    // Check if expired
    if (this.ttl && Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a specific entry from the cache.
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries from the cache.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the current number of entries in the cache.
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Get all keys in the cache (in LRU order, oldest first).
   */
  keys(): IterableIterator<K> {
    return this.cache.keys();
  }

  /**
   * Get all values in the cache (in LRU order, oldest first).
   */
  values(): IterableIterator<V> {
    return Array.from(this.cache.values()).map((entry) => entry.value).values();
  }

  /**
   * Remove all expired entries from the cache.
   * Only effective when TTL is configured.
   */
  prune(): void {
    if (!this.ttl) {
      return;
    }

    const now = Date.now();
    const keysToDelete: K[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }
}
