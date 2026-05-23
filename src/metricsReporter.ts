/**
 * Formats and outputs the collected metrics as a GitHub Actions step summary
 * or plain log output.
 */
import * as core from "@actions/core";
import { getSummary, MetricsSummary } from "./metrics";

export function formatMetricsTable(summary: MetricsSummary): string {
  const cacheHitRate =
    summary.cacheHits + summary.cacheMisses > 0
      ? (
          (summary.cacheHits / (summary.cacheHits + summary.cacheMisses)) *
          100
        ).toFixed(1)
      : "N/A";

  return [
    "## PullBrief Metrics",
    "",
    "| Metric | Value |",
    "|--------|-------|",
    `| Total Requests | ${summary.totalRequests} |`,
    `| Cache Hits | ${summary.cacheHits} |`,
    `| Cache Misses | ${summary.cacheMisses} |`,
    `| Cache Hit Rate | ${cacheHitRate}% |`,
    `| Retries | ${summary.retries} |`,
    `| Errors | ${summary.errors} |`,
    `| Total Tokens Used | ${summary.totalTokensUsed} |`,
    `| Avg Latency | ${summary.averageLatencyMs}ms |`,
  ].join("\n");
}

export async function reportMetrics(): Promise<void> {
  const summary = getSummary();
  const table = formatMetricsTable(summary);

  try {
    await core.summary.addRaw(table).write();
  } catch {
    // Step summary not available; fall back to log output
    core.info(table);
  }

  core.debug(
    `Metrics snapshot: ${JSON.stringify(summary)}`
  );
}
