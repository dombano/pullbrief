import { estimateCost, formatCostEstimate, getSupportedModels, TokenUsage } from "./costEstimator";

const sampleUsage: TokenUsage = {
  promptTokens: 1000,
  completionTokens: 200,
  totalTokens: 1200,
};

describe("estimateCost", () => {
  it("calculates cost for gpt-4o-mini", () => {
    const result = estimateCost("gpt-4o-mini", sampleUsage);
    expect(result.model).toBe("gpt-4o-mini");
    expect(result.totalTokens).toBe(1200);
    expect(result.estimatedCostUsd).toBeCloseTo(0.00000015 * 1000 + 0.0000006 * 200);
    expect(result.breakdown.inputCost).toBeCloseTo(0.00000015 * 1000);
    expect(result.breakdown.outputCost).toBeCloseTo(0.0000006 * 200);
  });

  it("calculates cost for gpt-4o", () => {
    const result = estimateCost("gpt-4o", sampleUsage);
    expect(result.estimatedCostUsd).toBeCloseTo(0.000005 * 1000 + 0.000015 * 200);
  });

  it("falls back to gpt-4o-mini pricing for unknown model", () => {
    const known = estimateCost("gpt-4o-mini", sampleUsage);
    const unknown = estimateCost("unknown-model", sampleUsage);
    expect(unknown.estimatedCostUsd).toBeCloseTo(known.estimatedCostUsd);
  });

  it("returns zero cost for zero tokens", () => {
    const result = estimateCost("gpt-4o-mini", { promptTokens: 0, completionTokens: 0, totalTokens: 0 });
    expect(result.estimatedCostUsd).toBe(0);
  });
});

describe("formatCostEstimate", () => {
  it("includes model, token counts, and cost", () => {
    const estimate = estimateCost("gpt-4o-mini", sampleUsage);
    const formatted = formatCostEstimate(estimate);
    expect(formatted).toContain("gpt-4o-mini");
    expect(formatted).toContain("1200");
    expect(formatted).toContain("$");
    expect(formatted).toContain("in: 1000");
    expect(formatted).toContain("out: 200");
  });
});

describe("getSupportedModels", () => {
  it("returns a non-empty list", () => {
    const models = getSupportedModels();
    expect(models.length).toBeGreaterThan(0);
  });

  it("includes gpt-4o and gpt-4o-mini", () => {
    const models = getSupportedModels();
    expect(models).toContain("gpt-4o");
    expect(models).toContain("gpt-4o-mini");
  });
});
