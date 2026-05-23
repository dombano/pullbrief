import * as crypto from 'crypto';

export interface CacheEntry {
  summary: string;
  createdAt: number;
}

export interface Cache {
  [key: string]: CacheEntry;
}

const TTL_MS = 60 * 60 * 1000; // 1 hour

const store: Cache = {};

export function buildCacheKey(diff: string, commits: string): string {
  const content = `${diff}::${commits}`;
  return crypto.createHash('sha256').update(content).digest('hex');
}

export function getCached(key: string): string | null {
  const entry = store[key];
  if (!entry) return null;

  const isExpired = Date.now() - entry.createdAt > TTL_MS;
  if (isExpired) {
    delete store[key];
    return null;
  }

  return entry.summary;
}

export function setCached(key: string, summary: string): void {
  store[key] = {
    summary,
    createdAt: Date.now(),
  };
}

export function clearCache(): void {
  for (const key of Object.keys(store)) {
    delete store[key];
  }
}

export function getCacheSize(): number {
  return Object.keys(store).length;
}
