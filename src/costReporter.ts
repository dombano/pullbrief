import { CostEstimate, formatCostEstimate } from "./costEstimator";
import { log } from "./logger";

export interface CostSession {
  estimates: CostEstimate[];
}

export function createCostSession(): CostSession {
  return { estimates: [] };
}

export function recordCost(session: CostSession, estimate: CostEstimate): void {
  session.estimates.push(estimate);
  log("debug", `Cost recorded: ${formatCostEstimate(estimate)}`);
}

export function sessionTotalCost(session: CostSession): number {
  return session.estimates.reduce((sum, e) => sum + e.estimatedCostUsd, 0);
}

export function sessionTotalTokens(session: CostSession): number {
  return session.estimates.reduce((sum, e) => sum + e.totalTokens, 0);
}

export function formatCostReport(session: CostSession): string {
  if (session.estimates.length === 0) {
    return "No API calls recorded.";
  }

  const lines: string[] = ["=== Cost Report ==="];

  session.estimates.forEach((estimate, i) => {
    lines.push(`  [${i + 1}] ${formatCostEstimate(estimate)}`);
  });

  const totalCost = sessionTotalCost(session).toFixed(6);
  const totalTokens = sessionTotalTokens(session);
  lines.push(`  Total: ${session.estimates.length} request(s), ${totalTokens} tokens, $${totalCost}`);

  return lines.join("\n");
}
