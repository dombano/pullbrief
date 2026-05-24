import { estimateCost, formatCostEstimate, getSupportedModels } from "./costEstimator";
import { createCostSession, recordCost, formatCostReport, sessionTotalCost } from "./costReporter";

describe("costEstimator + costReporter integration", () => {
  it("tracks costs across multiple models in one session", () => {
    const session = createCostSession();
    const models = getSupportedModels();

    models.forEach((model, i) => {
      const usage = {
        promptTokens: 100 * (i + 1),
        completionTokens: 50 * (i + 1),
        totalTokens: 150 * (i + 1),
      };
      recordCost(session, estimateCost(model, usage));
    });

    expect(session.estimates).toHaveLength(models.length);
    expect(sessionTotalCost(session)).toBeGreaterThan(0);

    const report = formatCostReport(session);
    expect(report).toContain("Cost Report");
    expect(report).toContain(`${models.length} request(s)`);
  });

  it("formats individual estimates without throwing", () => {
    const models = getSupportedModels();
    models.forEach((model) => {
      const estimate = estimateCost(model, { promptTokens: 200, completionTokens: 80, totalTokens: 280 });
      expect(() => formatCostEstimate(estimate)).not.toThrow();
      const formatted = formatCostEstimate(estimate);
      expect(formatted).toContain(model);
    });
  });

  it("cost scales linearly with token count", () => {
    const small = estimateCost("gpt-4o-mini", { promptTokens: 100, completionTokens: 50, totalTokens: 150 });
    const large = estimateCost("gpt-4o-mini", { promptTokens: 200, completionTokens: 100, totalTokens: 300 });
    expect(large.estimatedCostUsd).toBeCloseTo(small.estimatedCostUsd * 2);
  });
});
