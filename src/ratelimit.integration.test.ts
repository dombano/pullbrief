import { createRateLimiter } from "./ratelimit";

/**
 * Integration tests for rate limiter using real timers.
 * These tests are slower but verify real timing behaviour.
 */
describe("RateLimiter (integration)", () => {
  it("enforces minimum interval between requests", async () => {
    const minIntervalMs = 100;
    const limiter = createRateLimiter({ minIntervalMs });

    const t0 = Date.now();
    await limiter.acquire();
    const t1 = Date.now();
    await limiter.acquire();
    const t2 = Date.now();

    const firstElapsed = t1 - t0;
    const secondElapsed = t2 - t1;

    // First call should be near-instant
    expect(firstElapsed).toBeLessThan(50);
    // Second call should wait at least minIntervalMs
    expect(secondElapsed).toBeGreaterThanOrEqual(minIntervalMs - 10);
  }, 10_000);

  it("allows burst requests when minInterval is zero", async () => {
    const limiter = createRateLimiter({
      minIntervalMs: 0,
      maxRequestsPerMinute: 60,
    });

    const start = Date.now();
    await Promise.all([
      limiter.acquire(),
      limiter.acquire(),
      limiter.acquire(),
    ]);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(200);
    expect(limiter.getRequestCount()).toBe(3);
  }, 10_000);
});
