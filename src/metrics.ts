/**
 * Lightweight in-memory metrics collector for tracking action performance.
 */

export interface MetricsSummary {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  retries: number;
  totalTokensUsed: number;
  averageLatencyMs: number;
  errors: number;
}

interface MetricsState {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  retries: number;
  totalTokensUsed: number;
  latencies: number[];
  errors: number;
}

let state: MetricsState = createInitialState();

function createInitialState(): MetricsState {
  return {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    retries: 0,
    totalTokensUsed: 0,
    latencies: [],
    errors: 0,
  };
}

export function recordRequest(): void {
  state.totalRequests += 1;
}

export function recordCacheHit(): void {
  state.cacheHits += 1;
}

export function recordCacheMiss(): void {
  state.cacheMisses += 1;
}

export function recordRetry(): void {
  state.retries += 1;
}

export function recordTokensUsed(tokens: number): void {
  state.totalTokensUsed += tokens;
}

export function recordLatency(ms: number): void {
  state.latencies.push(ms);
}

export function recordError(): void {
  state.errors += 1;
}

export function getSummary(): MetricsSummary {
  const latencies = state.latencies;
  const averageLatencyMs =
    latencies.length > 0
      ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length
      : 0;

  return {
    totalRequests: state.totalRequests,
    cacheHits: state.cacheHits,
    cacheMisses: state.cacheMisses,
    retries: state.retries,
    totalTokensUsed: state.totalTokensUsed,
    averageLatencyMs: Math.round(averageLatencyMs),
    errors: state.errors,
  };
}

export function resetMetrics(): void {
  state = createInitialState();
}
