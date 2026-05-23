import { formatMetricsTable } from "./metricsReporter";
import { MetricsSummary } from "./metrics";

const baseSummary: MetricsSummary = {
  totalRequests: 5,
  cacheHits: 3,
  cacheMisses: 2,
  retries: 1,
  totalTokensUsed: 1500,
  averageLatencyMs: 320,
  errors: 0,
};

describe("formatMetricsTable", () => {
  it("includes all metric labels", () => {
    const output = formatMetricsTable(baseSummary);
    expect(output).toContain("Total Requests");
    expect(output).toContain("Cache Hits");
    expect(output).toContain("Cache Misses");
    expect(output).toContain("Cache Hit Rate");
    expect(output).toContain("Retries");
    expect(output).toContain("Errors");
    expect(output).toContain("Total Tokens Used");
    expect(output).toContain("Avg Latency");
  });

  it("calculates cache hit rate correctly", () => {
    const output = formatMetricsTable(baseSummary);
    // 3 hits / 5 total = 60.0%
    expect(output).toContain("60.0%");
  });

  it("shows N/A cache hit rate when no requests", () => {
    const empty: MetricsSummary = {
      ...baseSummary,
      cacheHits: 0,
      cacheMisses: 0,
    };
    expect(formatMetricsTable(empty)).toContain("N/A%");
  });

  it("renders as a markdown table", () => {
    const output = formatMetricsTable(baseSummary);
    expect(output).toContain("## PullBrief Metrics");
    expect(output).toContain("| Metric | Value |");
    expect(output).toContain("|--------|-------|");
  });

  it("includes numeric values from summary", () => {
    const output = formatMetricsTable(baseSummary);
    expect(output).toContain("5");
    expect(output).toContain("1500");
    expect(output).toContain("320ms");
  });
});
