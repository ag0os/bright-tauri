import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LRUCache } from './LRUCache';

describe('LRUCache', () => {
  describe('Basic Operations', () => {
    it('should store and retrieve values', () => {
      const cache = new LRUCache<string, number>();
      cache.set('key1', 100);
      expect(cache.get('key1')).toBe(100);
    });

    it('should return undefined for non-existent keys', () => {
      const cache = new LRUCache<string, number>();
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should update existing values', () => {
      const cache = new LRUCache<string, number>();
      cache.set('key1', 100);
      cache.set('key1', 200);
      expect(cache.get('key1')).toBe(200);
      expect(cache.size).toBe(1);
    });

    it('should delete values', () => {
      const cache = new LRUCache<string, number>();
      cache.set('key1', 100);
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.delete('key1')).toBe(false);
    });

    it('should clear all values', () => {
      const cache = new LRUCache<string, number>();
      cache.set('key1', 100);
      cache.set('key2', 200);
      cache.clear();
      expect(cache.size).toBe(0);
      expect(cache.get('key1')).toBeUndefined();
    });

    it('should check if key exists', () => {
      const cache = new LRUCache<string, number>();
      cache.set('key1', 100);
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(false);
    });
  });

  describe('LRU Eviction', () => {
    it('should evict least recently used entry when maxSize is reached', () => {
      const cache = new LRUCache<string, number>({ maxSize: 3 });

      cache.set('key1', 100);
      cache.set('key2', 200);
      cache.set('key3', 300);

      // All entries should be present
      expect(cache.get('key1')).toBe(100);
      expect(cache.get('key2')).toBe(200);
      expect(cache.get('key3')).toBe(300);
      expect(cache.size).toBe(3);

      // Adding a 4th entry should evict key1 (oldest)
      cache.set('key4', 400);
      expect(cache.size).toBe(3);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBe(200);
      expect(cache.get('key3')).toBe(300);
      expect(cache.get('key4')).toBe(400);
    });

    it('should move accessed entries to most recent position', () => {
      const cache = new LRUCache<string, number>({ maxSize: 3 });

      cache.set('key1', 100);
      cache.set('key2', 200);
      cache.set('key3', 300);

      // Access key1, making it most recent
      cache.get('key1');

      // Adding key4 should evict key2 (now oldest)
      cache.set('key4', 400);
      expect(cache.get('key1')).toBe(100);
      expect(cache.get('key2')).toBeUndefined();
      expect(cache.get('key3')).toBe(300);
      expect(cache.get('key4')).toBe(400);
    });

    it('should move updated entries to most recent position', () => {
      const cache = new LRUCache<string, number>({ maxSize: 3 });

      cache.set('key1', 100);
      cache.set('key2', 200);
      cache.set('key3', 300);

      // Update key1, making it most recent
      cache.set('key1', 150);

      // Adding key4 should evict key2 (now oldest)
      cache.set('key4', 400);
      expect(cache.get('key1')).toBe(150);
      expect(cache.get('key2')).toBeUndefined();
      expect(cache.get('key3')).toBe(300);
      expect(cache.get('key4')).toBe(400);
    });

    it('should handle maxSize of 1', () => {
      const cache = new LRUCache<string, number>({ maxSize: 1 });

      cache.set('key1', 100);
      expect(cache.get('key1')).toBe(100);

      cache.set('key2', 200);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBe(200);
      expect(cache.size).toBe(1);
    });

    it('should use default maxSize of 100', () => {
      const cache = new LRUCache<string, number>();

      // Add 100 entries
      for (let i = 0; i < 100; i++) {
        cache.set(`key${i}`, i);
      }
      expect(cache.size).toBe(100);

      // Adding one more should evict key0
      cache.set('key100', 100);
      expect(cache.size).toBe(100);
      expect(cache.get('key0')).toBeUndefined();
      expect(cache.get('key1')).toBe(1);
      expect(cache.get('key100')).toBe(100);
    });
  });

  describe('TTL (Time-To-Live)', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return undefined for expired entries', () => {
      const cache = new LRUCache<string, number>({ ttl: 1000 }); // 1 second TTL

      cache.set('key1', 100);
      expect(cache.get('key1')).toBe(100);

      // Advance time by 1.5 seconds
      vi.advanceTimersByTime(1500);

      expect(cache.get('key1')).toBeUndefined();
    });

    it('should not expire entries within TTL', () => {
      const cache = new LRUCache<string, number>({ ttl: 1000 }); // 1 second TTL

      cache.set('key1', 100);

      // Advance time by 0.5 seconds (within TTL)
      vi.advanceTimersByTime(500);

      expect(cache.get('key1')).toBe(100);
    });

    it('should update timestamp on set', () => {
      const cache = new LRUCache<string, number>({ ttl: 1000 });

      cache.set('key1', 100);

      // Advance time by 0.9 seconds
      vi.advanceTimersByTime(900);

      // Update the value (should reset timestamp)
      cache.set('key1', 200);

      // Advance another 0.9 seconds (total 1.8s from original set)
      vi.advanceTimersByTime(900);

      // Should still be valid (0.9s since last set)
      expect(cache.get('key1')).toBe(200);
    });

    it('should handle has() with expired entries', () => {
      const cache = new LRUCache<string, number>({ ttl: 1000 });

      cache.set('key1', 100);
      expect(cache.has('key1')).toBe(true);

      vi.advanceTimersByTime(1500);

      expect(cache.has('key1')).toBe(false);
    });

    it('should prune expired entries', () => {
      const cache = new LRUCache<string, number>({ ttl: 1000 });

      cache.set('key1', 100);
      cache.set('key2', 200);
      cache.set('key3', 300);

      // Advance time past TTL
      vi.advanceTimersByTime(1500);

      // Add new entry (not expired)
      cache.set('key4', 400);

      expect(cache.size).toBe(4); // Old entries still in cache

      cache.prune();

      expect(cache.size).toBe(1); // Only key4 remains
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
      expect(cache.get('key3')).toBeUndefined();
      expect(cache.get('key4')).toBe(400);
    });

    it('should not prune when TTL is not configured', () => {
      const cache = new LRUCache<string, number>(); // No TTL

      cache.set('key1', 100);
      cache.prune();

      expect(cache.size).toBe(1);
      expect(cache.get('key1')).toBe(100);
    });
  });

  describe('Complex Types', () => {
    it('should work with object values', () => {
      interface User {
        name: string;
        age: number;
      }

      const cache = new LRUCache<string, User>({ maxSize: 2 });

      cache.set('user1', { name: 'Alice', age: 30 });
      cache.set('user2', { name: 'Bob', age: 25 });

      expect(cache.get('user1')).toEqual({ name: 'Alice', age: 30 });
      expect(cache.get('user2')).toEqual({ name: 'Bob', age: 25 });
    });

    it('should work with number keys', () => {
      const cache = new LRUCache<number, string>({ maxSize: 2 });

      cache.set(1, 'one');
      cache.set(2, 'two');

      expect(cache.get(1)).toBe('one');
      expect(cache.get(2)).toBe('two');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty cache operations', () => {
      const cache = new LRUCache<string, number>();

      expect(cache.size).toBe(0);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.has('key1')).toBe(false);
      expect(cache.delete('key1')).toBe(false);
      cache.clear();
      expect(cache.size).toBe(0);
    });

    it('should handle rapid additions and evictions', () => {
      const cache = new LRUCache<string, number>({ maxSize: 10 });

      // Add 100 entries rapidly
      for (let i = 0; i < 100; i++) {
        cache.set(`key${i}`, i);
      }

      // Should only have last 10
      expect(cache.size).toBe(10);
      for (let i = 0; i < 90; i++) {
        expect(cache.get(`key${i}`)).toBeUndefined();
      }
      for (let i = 90; i < 100; i++) {
        expect(cache.get(`key${i}`)).toBe(i);
      }
    });
  });
});
