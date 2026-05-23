/**
 * Rate limiting utilities for OpenAI API calls.
 * Tracks request timestamps and enforces a minimum interval between calls.
 */

const DEFAULT_MIN_INTERVAL_MS = 1000;
const DEFAULT_MAX_REQUESTS_PER_MINUTE = 60;

export interface RateLimitOptions {
  minIntervalMs?: number;
  maxRequestsPerMinute?: number;
}

export interface RateLimiter {
  acquire(): Promise<void>;
  getRequestCount(): number;
  reset(): void;
}

export function createRateLimiter(options: RateLimitOptions = {}): RateLimiter {
  const minIntervalMs = options.minIntervalMs ?? DEFAULT_MIN_INTERVAL_MS;
  const maxRequestsPerMinute =
    options.maxRequestsPerMinute ?? DEFAULT_MAX_REQUESTS_PER_MINUTE;

  let lastRequestTime = 0;
  let requestTimestamps: number[] = [];

  function pruneOldTimestamps(now: number): void {
    const cutoff = now - 60_000;
    requestTimestamps = requestTimestamps.filter((t) => t > cutoff);
  }

  async function acquire(): Promise<void> {
    const now = Date.now();
    pruneOldTimestamps(now);

    if (requestTimestamps.length >= maxRequestsPerMinute) {
      const oldest = requestTimestamps[0];
      const waitUntil = oldest + 60_000;
      const waitMs = waitUntil - now;
      if (waitMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }

    const elapsed = Date.now() - lastRequestTime;
    if (elapsed < minIntervalMs) {
      await new Promise((resolve) =>
        setTimeout(resolve, minIntervalMs - elapsed)
      );
    }

    lastRequestTime = Date.now();
    requestTimestamps.push(lastRequestTime);
  }

  function getRequestCount(): number {
    pruneOldTimestamps(Date.now());
    return requestTimestamps.length;
  }

  function reset(): void {
    lastRequestTime = 0;
    requestTimestamps = [];
  }

  return { acquire, getRequestCount, reset };
}
