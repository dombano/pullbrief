import { createCostSession, recordCost, sessionTotalCost, sessionTotalTokens, formatCostReport } from "./costReporter";
import { estimateCost, TokenUsage } from "./costEstimator";

const usage1: TokenUsage = { promptTokens: 500, completionTokens: 100, totalTokens: 600 };
const usage2: TokenUsage = { promptTokens: 800, completionTokens: 150, totalTokens: 950 };

describe("createCostSession", () => {
  it("starts with empty estimates", () => {
    const session = createCostSession();
    expect(session.estimates).toHaveLength(0);
  });
});

describe("recordCost", () => {
  it("adds estimate to session", () => {
    const session = createCostSession();
    recordCost(session, estimateCost("gpt-4o-mini", usage1));
    expect(session.estimates).toHaveLength(1);
  });

  it("accumulates multiple estimates", () => {
    const session = createCostSession();
    recordCost(session, estimateCost("gpt-4o-mini", usage1));
    recordCost(session, estimateCost("gpt-4o-mini", usage2));
    expect(session.estimates).toHaveLength(2);
  });
});

describe("sessionTotalCost", () => {
  it("returns 0 for empty session", () => {
    expect(sessionTotalCost(createCostSession())).toBe(0);
  });

  it("sums all estimate costs", () => {
    const session = createCostSession();
    const e1 = estimateCost("gpt-4o-mini", usage1);
    const e2 = estimateCost("gpt-4o-mini", usage2);
    recordCost(session, e1);
    recordCost(session, e2);
    expect(sessionTotalCost(session)).toBeCloseTo(e1.estimatedCostUsd + e2.estimatedCostUsd);
  });
});

describe("sessionTotalTokens", () => {
  it("sums all token counts", () => {
    const session = createCostSession();
    recordCost(session, estimateCost("gpt-4o-mini", usage1));
    recordCost(session, estimateCost("gpt-4o-mini", usage2));
    expect(sessionTotalTokens(session)).toBe(600 + 950);
  });
});

describe("formatCostReport", () => {
  it("returns message for empty session", () => {
    expect(formatCostReport(createCostSession())).toBe("No API calls recorded.");
  });

  it("includes header and total line", () => {
    const session = createCostSession();
    recordCost(session, estimateCost("gpt-4o-mini", usage1));
    const report = formatCostReport(session);
    expect(report).toContain("Cost Report");
    expect(report).toContain("Total:");
    expect(report).toContain("1 request(s)");
  });
});
