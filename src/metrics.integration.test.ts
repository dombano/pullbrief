/**
 * Integration test: simulates a full request lifecycle and verifies metrics.
 */
import {
  recordRequest,
  recordCacheHit,
  recordCacheMiss,
  recordRetry,
  recordTokensUsed,
  recordLatency,
  recordError,
  getSummary,
  resetMetrics,
} from "./metrics";

beforeEach(() => {
  resetMetrics();
});

describe("metrics integration", () => {
  it("reflects a realistic request flow with cache miss and retry", () => {
    // First request: cache miss, retry, then success
    recordRequest();
    recordCacheMiss();
    recordRetry();
    recordLatency(450);
    recordTokensUsed(320);

    // Second request: cache hit
    recordRequest();
    recordCacheHit();
    recordLatency(10);

    // Third request: cache miss, error
    recordRequest();
    recordCacheMiss();
    recordError();
    recordLatency(200);

    const summary = getSummary();

    expect(summary.totalRequests).toBe(3);
    expect(summary.cacheHits).toBe(1);
    expect(summary.cacheMisses).toBe(2);
    expect(summary.retries).toBe(1);
    expect(summary.errors).toBe(1);
    expect(summary.totalTokensUsed).toBe(320);
    expect(summary.averageLatencyMs).toBe(220); // (450+10+200)/3 = 220
  });

  it("handles high volume recording without issues", () => {
    for (let i = 0; i < 1000; i++) {
      recordRequest();
      recordLatency(i);
      recordTokensUsed(10);
    }
    const summary = getSummary();
    expect(summary.totalRequests).toBe(1000);
    expect(summary.totalTokensUsed).toBe(10000);
    expect(summary.averageLatencyMs).toBe(499); // floor of 499.5
  });
});
