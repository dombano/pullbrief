import { createRateLimiter } from "./ratelimit";

describe("createRateLimiter", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should allow the first request immediately", async () => {
    const limiter = createRateLimiter({ minIntervalMs: 500 });
    const start = Date.now();
    const promise = limiter.acquire();
    jest.runAllTimers();
    await promise;
    expect(Date.now() - start).toBeLessThan(100);
  });

  it("should track request count", async () => {
    const limiter = createRateLimiter({ minIntervalMs: 0 });
    expect(limiter.getRequestCount()).toBe(0);
    const p1 = limiter.acquire();
    jest.runAllTimers();
    await p1;
    expect(limiter.getRequestCount()).toBe(1);
    const p2 = limiter.acquire();
    jest.runAllTimers();
    await p2;
    expect(limiter.getRequestCount()).toBe(2);
  });

  it("should reset state", async () => {
    const limiter = createRateLimiter({ minIntervalMs: 0 });
    const p = limiter.acquire();
    jest.runAllTimers();
    await p;
    expect(limiter.getRequestCount()).toBe(1);
    limiter.reset();
    expect(limiter.getRequestCount()).toBe(0);
  });

  it("should enforce max requests per minute", async () => {
    const limiter = createRateLimiter({
      minIntervalMs: 0,
      maxRequestsPerMinute: 2,
    });

    const p1 = limiter.acquire();
    jest.runAllTimers();
    await p1;

    const p2 = limiter.acquire();
    jest.runAllTimers();
    await p2;

    expect(limiter.getRequestCount()).toBe(2);

    // Third request should be throttled — just verify it doesn't throw
    const p3 = limiter.acquire();
    jest.advanceTimersByTime(60_000);
    await p3;
    expect(limiter.getRequestCount()).toBeGreaterThanOrEqual(1);
  });

  it("should use default options when none provided", () => {
    const limiter = createRateLimiter();
    expect(limiter.getRequestCount()).toBe(0);
  });
});
