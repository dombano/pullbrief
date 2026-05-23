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

describe("metrics", () => {
  it("starts with zero values", () => {
    const summary = getSummary();
    expect(summary.totalRequests).toBe(0);
    expect(summary.cacheHits).toBe(0);
    expect(summary.cacheMisses).toBe(0);
    expect(summary.retries).toBe(0);
    expect(summary.totalTokensUsed).toBe(0);
    expect(summary.averageLatencyMs).toBe(0);
    expect(summary.errors).toBe(0);
  });

  it("records requests", () => {
    recordRequest();
    recordRequest();
    expect(getSummary().totalRequests).toBe(2);
  });

  it("records cache hits and misses", () => {
    recordCacheHit();
    recordCacheHit();
    recordCacheMiss();
    const summary = getSummary();
    expect(summary.cacheHits).toBe(2);
    expect(summary.cacheMisses).toBe(1);
  });

  it("records retries and errors", () => {
    recordRetry();
    recordError();
    recordError();
    const summary = getSummary();
    expect(summary.retries).toBe(1);
    expect(summary.errors).toBe(2);
  });

  it("accumulates token usage", () => {
    recordTokensUsed(100);
    recordTokensUsed(250);
    expect(getSummary().totalTokensUsed).toBe(350);
  });

  it("calculates average latency", () => {
    recordLatency(100);
    recordLatency(200);
    recordLatency(300);
    expect(getSummary().averageLatencyMs).toBe(200);
  });

  it("returns 0 average latency when no latencies recorded", () => {
    expect(getSummary().averageLatencyMs).toBe(0);
  });

  it("resets all metrics", () => {
    recordRequest();
    recordCacheHit();
    recordTokensUsed(500);
    resetMetrics();
    const summary = getSummary();
    expect(summary.totalRequests).toBe(0);
    expect(summary.cacheHits).toBe(0);
    expect(summary.totalTokensUsed).toBe(0);
  });
});
